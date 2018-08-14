import { DbConnection } from "../../../interface/DbConnectionInterface"
import { GraphQLResolveInfo } from "../../../../node_modules/@types/graphql"
import { Transaction } from "../../../../node_modules/@types/sequelize"
import { CommentInstance } from "../../../models/CommentModel"
import { handleError, throwError } from "../../../utils/utils"
import { authResolvers } from "../../composable/auth.resolver";
import { compose } from "../../composable/composable.resolver";
import { AuthUser } from "../../../interface/AuthUserInterface";
import { DataLoaders } from "../../../interface/DataLoadersInterface";
import { RequestedFields } from "../../ast/RequestedFields";

export const commentResolvers = {

    Comment: {

        user: (comment, args, {db, dataloaders: {userLoader}}: {db: DbConnection, dataloaders: DataLoaders}, info: GraphQLResolveInfo) => {
            return userLoader
                .load({key: comment.get('user'), info})
                .catch(handleError)
        },

        post: (comment, args, {db, dataloaders: {postLoader}}: {db: DbConnection, dataloaders: DataLoaders}, info: GraphQLResolveInfo) => {
            return postLoader
                .load({key: comment.get('post'), info})
                .catch(handleError)
        }

    },

    Query: {

        commentsByPost: compose()((parent, {postId, first = 10, offset = 0}, {db, requestedFields}: {db: DbConnection, requestedFields: RequestedFields}, info: GraphQLResolveInfo) => {
            postId = parseInt(postId)
            return db.Comment
                .findAll({
                    where: {post: postId},
                    limit: first,
                    offset: offset,
                    attributes: requestedFields.getFields(info, {keep: undefined})
                })
                .catch(handleError)
        })

    },

    Mutation: {

        createComment: compose(...authResolvers)((parent, {input}, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            input.user = authUser.id
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .create(input, {transaction: t})
            }).catch(handleError)
        }),

        updateComment: compose(...authResolvers)((parent, {id, input}, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            id = parseInt(id)
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .findById(id)
                    .then((comment: CommentInstance) => {
                        throwError(!comment, `Comment with id ${id} not found!`)
                        throwError(comment.get('user') != authUser.id, `Unauthorized! You can only edit comments by yourself!`)
                        input.user = authUser.id
                        return comment.update(input, {transaction: t})
                    })
            }).catch(handleError)
        }),

        deleteComment: compose(...authResolvers)((parent, {id}, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            id = parseInt(id)
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .findById(id)
                    .then((comment: CommentInstance) => {
                        throwError(!comment, `Comment with id ${id} not found!`)
                        throwError(comment.get('user') != authUser.id, `Unauthorized! You can only delete comments by yourself!`)
                        return comment.destroy({transaction: t})
                            .then(comment => !!comment)
                    })
            }).catch(handleError)
        })

    }

}