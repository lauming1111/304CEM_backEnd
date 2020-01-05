const Recipe = require('../models/recipe');
const User = require('../models/user');
const Comment = require('../models/comment');
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
        createdRecipes: RecipeById.bind(this, r._doc.createdRecipes),
        createdComments: CommentById.bind(this, r._doc.createdComments)
      };
    })
    .catch((e) => {
      throw e;
    });
};

/**
 * get Recipe detail from the user
 * @param id Recipe Object ID
 */
const RecipeById = (id) => {
  return Recipe.find({
    _id: { $in: id }
  })
    .then((r) => {
      return r.map(recipe => {
        return transformResponse(recipe);
      });
    })
    .catch((e) => {
      throw e;
    });
};

/**
 * get Recipe detail from the user
 * @param id Recipe Object ID
 */
const CommentById = (id) => {
  return Comment.find({
    _id: { $in: id }
  })
    .then((r) => {
      return r.map(recipe => {
        return transformResponse(recipe);
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
    const decodedPassword = Buffer.from(r.password, 'base64').toString('utf8');
    const hashPassword = crypto
      .createHmac('sha256', tokenSecretKey)
      .update(decodedPassword)
      .digest('hex');

    if (user._doc.password !== hashPassword) {
      throw new Error('Fail to login');
    }

    const token = jwt.sign({
      userId: user._id,
      email: user.email,
    }, tokenSecretKey, {
      expiresIn: '1h'
    });

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      token,
      tokenExpirationDate: 1,
    };

  },
  createRecipes: (r, args) => {
    if (!args.isAuth) {
      throw new Error('Unauthenticated');
    }
    let recipeInput = null;
    const recipe = new Recipe({
      name: r.recipeInput.name,
      context: r.recipeInput.context,
      createdTimestamp: new Date().getTime(),
      updateTimestamp: new Date().getTime(),
      creator: args.userId,
    });

    return recipe
      .save()
      .then((r) => {
        recipeInput = transformResponse(r);
        return User
          .findById(args.userId);
      })
      .then((user) => {
        if (!user) {
          throw new Error('User not found');
        }
        user.createdRecipes.push(recipe);
        return user.save();
      })
      .then((r) => {
        return recipeInput;
      })
      .catch((e) => {
        throw e;
      });
  },
  createComments: (r, args) => {
    if (!args.isAuth) {
      throw new Error('Unauthenticated');
    }
    let commentInput = null;
    const comment = new Comment({
      comment: r.commentInput.comment,
      rate: r.commentInput.rate,
      recipeId: r.commentInput.recipeId,
      createdTimestamp: new Date().getTime(),
      updateTimestamp: new Date().getTime(),
      creator: args.userId,
    });

    return comment
      .save()
      .then((resp) => {
        commentInput = transformResponse(resp);
        return User
          .findById(args.userId);
      })
      .then((user) => {
        if (!user) {
          throw new Error('User not found');
        }
        user.createdComments.push(comment);
        return user.save();
      })
      .then(() => {
        return Recipe
          .findOne({
            _id: r.commentInput.recipeId
          })
          .then((recipe => {
            console.log(r);
            recipe.createdComments.push(comment);
            recipe.save();
          }));
      })
      .then((r) => {
        return commentInput;
      })
      .catch((e) => {
        throw e;
      });
  },
  createUser: (r) => {
    const decodedPassword = Buffer.from(r.userInput.password, 'base64').toString('utf8');
    const hashPassword = crypto
      .createHmac('sha256', tokenSecretKey)
      .update(decodedPassword)
      .digest('hex');

    const user = new User({
      name: r.userInput.name,
      email: r.userInput.email,
      password: hashPassword,
      createdTimestamp: new Date().getTime(),
      updateTimestamp: new Date().getTime(),
    });

    // check user if exist before creating new one
    return User.findOne({
      email: r.userInput.email
    })
      .then((r) => {
        if (r) {
          throw new Error('User already exist.');
        }
        return user
          .save()
          .then((r) => {
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
  recipes: () => {
    return Recipe.find()
      .then((r) => {
        return r.map(data => {
          return transformResponse(data);
        });
      })
      .catch((e) => {
        throw e;
      });
  },
  comments: () => {
    return Comment.find()
      .then((r) => {
        console.log(r);
        return r.map(data => {
          return transformResponse(data);
        });
      })
      .catch((e) => {
        throw e;
      });
  },
  deleteRecipe: async (r) => {
    const recipe = await Recipe.findById(r.recipeId);
    if (!recipe) {
      throw  new Error('Recipe do not exist');
    }

    const recipeDetail = transformResponse(recipe);

    await Recipe.deleteOne({
      _id: recipeDetail._id
    });

    return recipeDetail;
  },
  deleteComment: async (r) => {
    console.log(r);
    const comment = await Comment.findById(r.commentId);
    if (!comment) {
      throw new Error('Comment do not exist');
    }

    const commentDetail = transformResponse(comment);

    await Comment.deleteOne({
      _id: commentDetail._id
    });

    return commentDetail;
  },
};