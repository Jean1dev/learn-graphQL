import { makeExecutableSchema } from 'graphql-tools'

const users: any[] = [
    {
        id: 1,
        name: 'Jean',
        email: 'jean@jean'
    },
    {
        id: 2,
        name: 'tal',
        email: 'tal@tal'
    }
]


const typeDefs = `
    type User {
        id: ID!
        name: String!
        email: String!
    }

    type Query{
        allUsers: [User!]!
    }
`

const resolvers = {
    Query: {
        allUsers: () => users
    }
}

export default makeExecutableSchema({typeDefs, resolvers})