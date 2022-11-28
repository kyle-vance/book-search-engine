const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({
                    _id: context.user._id
                }).select('-__v -password')
                return userData;
            }
            throw new AuthenticationError('You need to be logged in!');
        }
    },

    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError('User does not exist, please create new account')
            }
            correctPassword = await user.isCorrectPassword(password);
            if (!correctPassword) {
                throw new AuthenticationError('Incorrect Password')
            }
            const token = signToken(user);
            return { token, user };
        },

        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
        },

        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const updateUser = await User.findOneAndUpdate (
                    {_id: context.user._id},{ $pull: { savedBooks: { bookId}}}, {new: true}
                )
                return updateUser;
            }
            throw new AuthenticationError('Please log in')
        },
        
        saveBook: async (parent, {book}, context) => {
            if (context.user) {
                const updateUser = await User.findOneAndUpdate (
                    {_id: context.user._id},{ $addToSet: { savedBooks:  book}}, {new: true}
                )
                return updateUser;
            }
            throw new AuthenticationError('Please log in')
        }
    },
};
        


module.exports = resolvers;