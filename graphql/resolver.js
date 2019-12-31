const Homework = require('../models/homework');
const User = require('../models/user');
const crypto = require('crypto');

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
  createHomeworks: (r) => {
    console.log(r);
    let homeworkInput = null;
    const homework = new Homework({
      name: r.homeworkInput.name,
      creator: '5e0b01a43e4c4c0f804e822c',
    });

    return homework
      .save()
      .then((r) => {
        homeworkInput = transformResponse(r);
        return User
          .findById('5e0b01a43e4c4c0f804e822c');
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
    const secret = 'abcdefg';
    const hashPassword = crypto
      .createHmac('sha256', secret)
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