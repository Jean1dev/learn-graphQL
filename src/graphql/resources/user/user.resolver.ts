import { GraphQLResolveInfo } from "../../../../node_modules/@types/graphql";
import { DbConnection } from "../../../interface/DbConnectionInterface";
import { UserInstance } from "../../../models/UserModel";
import { Transaction } from "../../../../node_modules/@types/sequelize";
import { handleError } from "../../../utils/utils";

export const userResolvers = {

    User: {
        posts: (parent, { first = 10, offset = 0 }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            return db.Post.findAll({
                where: { author: parent.get('id') },
                limit: first,
                offset: offset
            })
            .catch(handleError)
        }
    },

    Query: {
        users: (parent, { first = 10, offset = 0 }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            return db.User.findAll({
                limit: first,
                offset: offset
            })
        },

        user: (parent, { id }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            id = parseInt(id)
            return db.User.findById(id).then((user: UserInstance) => {
                if (!user) throw new Error(`User not Found : ${id}`)

                return user
            })
        }
    },

    Mutation: {
        createUser: (parent, args, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User.create(args.input, { transaction: t })
            }).catch(handleError)
        },

        updateUser: (parent, args, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            args.id = parseInt(args.id)
            return db.sequelize.transaction((t: Transaction) => {
                return db.User.findById(args.id).then((user: UserInstance) => {
                    if (!user) throw new Error(`User not Found : ${args.id}`)

                    return user.update(args.input, { transaction: t })
                })
            }).catch(handleError)
        },

        updateUserPassword: (parent, args, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            args.id = parseInt(args.id)
            return db.sequelize.transaction((t: Transaction) => {
                return db.User.findById(args.id).then((user: UserInstance) => {
                    if (!user) throw new Error(`User not Found : ${args.id}`)

                    return user.update(args.input, { transaction: t }).then((user: UserInstance) => {
                        return !!user
                    })
                })
            })
        },

        deleteUser: (parent, args, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            args.id = parseInt(args.id)
            return db.sequelize.transaction((t: Transaction) => {
                return db.User.findById(args.id).then((user: UserInstance) => {
                    if (!user) throw new Error(`User not Found : ${args.id}`)

                    return user.destroy({ transaction: t }).then(user => !!user)
                })
            }).catch(handleError)
        }
    }
}