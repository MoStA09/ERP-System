const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')

const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const tokenKey = require('./keys').secretOrKey

const User = require('../models/User')

let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = tokenKey

module.exports = function(passport){
    passport.use('users',
        new LocalStrategy({ usernameField: 'username'}, (username, password, done) => {
            //Match User
            User.findOne({ username: username })
            .then(user => {
                if(!user){
                    return done(null, false, {message: 'That username is not registered' })
                }
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if(err)
                        throw err
                    if(isMatch){
                        return done(null, user)
                    }
                    else{
                        return done(null, false, {message: 'Wrong Username or Password!'})
                    }
                })
            })
            .catch(err => console.log(err))
        })
    )
    passport.serializeUser(function(user, done) {
        done(null, user.id)
    })
      
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user)
        })
    })
    
    passport.use('userAuth',new JwtStrategy(opts, async (jwtPayload, done) => {
        const currentUser = await User.findById(jwtPayload._id)
        if(currentUser) return done(null,currentUser)
        return done(null,false)
     }))

    passport.use('itAuth', new JwtStrategy(opts, async (jwtPayload, done) => {
        const currentUser = await User.findById(jwtPayload._id)
        if (currentUser && currentUser.type === 'it') return done(null, currentUser)
        return done(null, false)
    }))

    passport.use('storeDirectorAuth', new JwtStrategy(opts, async (jwtPayload, done) => {
        const currentUser = await User.findById(jwtPayload._id)
        if (currentUser && currentUser.type === 'store director') return done(null, currentUser)
        return done(null, false)
    }))

    passport.use('salesmanAuth', new JwtStrategy(opts, async (jwtPayload, done) => {
        const currentUser = await User.findById(jwtPayload._id)
        if (currentUser && currentUser.type === 'salesman') return done(null, currentUser)
        return done(null, false)
    }))

    passport.use('salesSupervisorAuth', new JwtStrategy(opts, async (jwtPayload, done) => {
        const currentUser = await User.findById(jwtPayload._id)
        if (currentUser && currentUser.type === 'sales supervisor') return done(null, currentUser)
        return done(null, false)
    }))

    passport.use('salesDirectorAuth', new JwtStrategy(opts, async (jwtPayload, done) => {
        const currentUser = await User.findById(jwtPayload._id)
        if (currentUser && currentUser.type === 'sales director') return done(null, currentUser)
        return done(null, false)
    }))

    passport.use('financialDirectorAuth', new JwtStrategy(opts, async (jwtPayload, done) => {
        const currentUser = await User.findById(jwtPayload._id)
        if (currentUser && currentUser.type === 'financial director') return done(null, currentUser)
        return done(null, false)
    }))

    passport.use('accountingSupervisorAuth', new JwtStrategy(opts, async (jwtPayload, done) => {
        const currentUser = await User.findById(jwtPayload._id)
        if (currentUser && currentUser.type === 'accounting supervisor') return done(null, currentUser)
        return done(null, false)
    }))

    passport.use('accountantAuth', new JwtStrategy(opts, async (jwtPayload, done) => {
        const currentUser = await User.findById(jwtPayload._id)
        if (currentUser && currentUser.type === 'accountant') return done(null, currentUser)
        return done(null, false)
    }))

    passport.use('collectorAuth', new JwtStrategy(opts, async (jwtPayload, done) => {
        const currentUser = await User.findById(jwtPayload._id)
        if (currentUser && currentUser.type === 'collector') return done(null, currentUser)
        return done(null, false)
    }))

    passport.use('generalManagerAuth', new JwtStrategy(opts, async (jwtPayload, done) => {
        const currentUser = await User.findById(jwtPayload._id)
        if (currentUser && currentUser.type === 'general manager') return done(null, currentUser)
        return done(null, false)
    }))

    passport.use('currentUserAuth', new JwtStrategy(opts, async (jwtPayload, done) => {
        const currentUser = await User.findById(jwtPayload._id)
        if (currentUser) return done(null, currentUser)
        return done(null, false)
    }))
}