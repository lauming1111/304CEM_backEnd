const Homework = require('../models/homework');
const User = require('../models/user');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { tokenSecretKey } = require('../lib/config');

/**
 * refactor function to handle return basic result
 * @param r data
 */
const transformResponse = (r) => {
  return {
    ...r._doc,
    creator: userById.bind(this, r.creator)
  };
};

/**
 * get user details from ID
 * @param id Object Id
 */
const userById = (id) => {
  return User.findById(id)
    .then((r) => {
      return {
        ...r._doc,
        createdHomeworks: homeworkById.bind(this, r._doc.createdHomeworks)
      };
    })
    .catch((e) => {
      throw e;
    });
};

/**
 * get homework detail from the user
 * @param id homework Object ID
 */
const homeworkById = (id) => {
  return Homework.find({
    _id: { $in: id }
  })
    .then((r) => {
      return r.map(homework => {
        return transformResponse(homework);
      });
    })
    .catch((e) => {
      throw e;
    });
};

module.exports = {
  login: async (r) => {
    // verify user exist or not
    const user = await User.findOne({
      email: r.email,
    });

    if (!user) {
      throw new Error('Fail to login');
    }
    // verify passowrd
    const hashPassword = crypto
      .createHmac('sha256', tokenSecretKey)
      .update(r.password)
      .digest('hex');

    if (user._doc.password !== hashPassword) {
      throw new Error('Fail to login');
    }

    const token = jwt.sign({
      userId: user._id,
      email: user.email
    }, tokenSecretKey, {
      expiresIn: '1h'
    });

    return {
      userId: user.id,
      token,
      tokenExpirationDate: 1,
    };

  },
  createHomeworks: (r, args) => {
    if (!args.isAuth) {
      throw new Error('Unauthenticated');
    }
    let homeworkInput = null;
    const homework = new Homework({
      name: r.homeworkInput.name,
      creator: args.userId,
    });

    return homework
      .save()
      .then((r) => {
        homeworkInput = transformResponse(r);
        return User
          .findById(args.userId);
      })
      .then((user) => {
        if (!user) {
          throw new Error('User not found');
        }
        user.createdHomeworks.push(homework);
        return user.save();
      })
      .then((r) => {
        return homeworkInput;
      })
      .catch((e) => {
        throw e;
      });
  },
  createUser: (r) => {

    const hashPassword = crypto
      .createHmac('sha256', tokenSecretKey)
      .update(r.userInput.password)
      .digest('hex');

    const user = new User({
      name: r.userInput.name,
      email: r.userInput.email,
      password: hashPassword,
    });

    // check user if exist before creating new one
    return User.findOne({
      email: r.userInput.email
    })
      .then((r) => {
        console.log(r);
        if (r) {
          throw new Error('User already exist.');
        }
        console.log('shoudnt');
        return user
          .save()
          .then((r) => {
            console.log(r);
            return {
              ...r._doc,
              password: null // do not return password in the response
            };
          });
      })
      .catch((e) => {
        throw e;
      });
  },
  homeworks: () => {
    return Homework.find()
      // .populate('creator')
      .then((r) => {
        return r.map(data => {
          return transformResponse(data);
        });
      })
      .catch((e) => {
        throw e;
      });
  },
  deleteHomework: async (r) => {
    const homework = await Homework.findById(r.homeworkId);
    if (!homework) {
      throw  new Error('Homework do not exist');
    }

    const homeworkDetail = transformResponse(homework);

    await Homework.deleteOne({
      _id: homeworkDetail._id
    });

    return homeworkDetail;
  },
};