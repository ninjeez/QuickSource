'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('lodash'),
    errorHandler = require('./errors.server.controller'),
    Profile = mongoose.model('Profile'),
    Experience = mongoose.model('Experience');

/**
 * Create a Experience
 */
var create = function(req, res, type) {
    var profile = req.profile;
    var experience = new Experience(req.body);
    experience.profile = req.user.profile;
    experience.updated = Date.now();
    experience.type = type;
    console.log(req.body);
    console.log(type);
    experience.save(function(err) {
        if (err) {
            console.log(err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            switch(type){
                case 'position':    profile.positions.push(experience); break;
                case 'education':   profile.educations.push(experience); break;
                case 'course':      profile.courses.push(experience); break;
                case 'publication': profile.publications.push(experience); break;
                default: return res.status(400).send({ message: 'Cannot save experience to profile' });
            }
            profile.save(function(){
                res.jsonp(experience);
            });
        }
    });
};
exports.createPosition = function(req, res) {   create(req, res, 'position'); };
exports.createEducation = function(req, res) {  create(req, res, 'education'); };
exports.createCourse = function(req, res) {     create(req, res, 'course'); };
exports.createPublication = function(req, res) {create(req, res, 'publication'); };

/**
 * Show the current Experience
 */
exports.read = function(req, res) {
    res.json(req.experience);
};

/**
 * Update a Experience
 */
exports.update = function(req, res) {
    var experience = req.experience;

    experience = _.extend(experience , req.body);
    experience.updated = Date.now();

    experience.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(experience);
        }
    });
};

/**
 * Delete an Experience
 */
exports.setInactive = function(req, res) {
    var experience = req.experience;
    experience = _.extend(experience , { isActive : false, updated : Date.now() });

    experience.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(experience);
        }
    });
};

/**
 * Experience middleware
 */
exports.experienceByID = function(req, res, next, id) {
    Experience.findById(id).exec(function(err, experience) {
        if (err) return next(err);
        if (!experience) return next(new Error('Failed to load Experience ' + id));

        switch(experience.type){
            case 'position':
                experience.major = undefined;
                experience.gpa = undefined;
                experience.courseNumber = undefined;
                experience.authors = undefined;
                break;

            case 'education':
                experience.courseNumber = undefined;
                experience.authors = undefined;
                break;

            case 'course':
                experience.major = undefined;
                experience.gpa = undefined;
                experience.authors = undefined;
                break;

            case 'publication':
                experience.major = undefined;
                experience.gpa = undefined;
                experience.courseNumber = undefined;
                break;

            default :
                return next(new Error('The experience ' + id + ' does not have a specified type'));
        }

        req.experience = experience;
        next();
    });
};

/**
 * Experience authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.experience.profile.id !== req.user.profile.id) {
        return res.status(403).send('User is not authorized');
    }
    next();
};
