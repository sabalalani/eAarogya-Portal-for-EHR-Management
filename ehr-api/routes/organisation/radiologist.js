//Radiologist Routes
const express = require('express');
const router = express.Router();
const passport = require('passport');
const ehrRadiologist = require('../../FabricHelperRadiologist');
const User = require("../../models/user");
const AadhaarUser = require('../../models/aadhaaruser');
const Data = require('../../models/data');

//All routes have prefix '/organisation/radiologist'
router.get('/login', function (req, res) {
    res.render('org/org-login', {
        org: 'radiologist'
    });
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/organisation/radiologist',
    failureRedirect: '/organisation/radiologist/login'
}), function (req, res) {});


router.use((req, res, next) => {
    if (req.user.type == 'radiologist')
        next();
    else
        res.redirect('/');
});

router.get('/', function (req, res) {
    res.render('org/radiologistPortal', {
        details: {},
        error: null,
        message: null
    });
});


router.get('/medicalID', function (req, res) {
    res.render('org/radiologistPortal', {
        details: {},
        error: null,
        message: null
    });
});

router.post('/medicalID', function (req, res) {
    let medicalID = req.body.medicalID;
    let doc = {
        'medicalID': medicalID
    }
    User.findOne({
        _id: MedicalID
    }, function (err, found) {
        if (err || !found)
            return res.render('org/radiologistPortal', {
                details: {},
                error: res.__('messages.error'),
                message: null,
            })
        let perm = found.permission.indexOf(req.user._id) + 1;
        if (perm) {
            ehrRadiologist.getReport(req, res, doc);
        } else {
            res.render("org/radiologistPortal", {
                details: {},
                error: res.__('messages.noAccess'),
                message: null
            })
        }
    });
});

router.get('/addreport', function (req, res) {
    res.render('org/radiologistPortal', {
        details: {},
        error: null,
        message: null
    });
});

router.post('/addreport', async function (req, res) {
    const MedicalID = req.body.medicalID
    let Diagnosis = req.body.diagnoses;
    let report = Diagnosis;
    let links = req.body.links;
    let addedBy = req.user._id;
    let doc = {
        'medicalID': MedicalID,
        'report': report,
        'links': links,
        'addedby': addedBy
    }
    const response = AadhaarUser.findOne({
        aadhaarNo: MedicalID
    })
    const address = response.address.split(',')
    const state = address[address.length - 1]
    const disease = Diagnosis
    let data = new Data({
        state: state,
        disease: disease
    })
    data.save((err, response) => {
        if (err) {
            res.send(err)
        } else {
            console.log(response)
        }
    })
    ehrRadiologist.addrLReport(req, res, doc);
});

router.get('/getreport', function (req, res) {
    res.render('org/radiologistPortal', {
        details: {},
        error: null,
        message: null
    });
});

router.post('/getreport', function (req, res) {
    let medicalID = req.body.medicalID;
    let doc = {
        'medicalID': medicalID
    }
    ehrRadiologist.getReport(req, res, doc);
});

router.get('/addprescription', function (req, res) {
    res.render('org/radiologistPortal', {
        details: {},
        error: null,
        message: null
    });
});

router.post('/addprescription', function (req, res) {
    let medicalID = req.body.medicalID;
    let prescription = req.body.prescription;
    let addedBy = req.user._id
    let doc = {
        'medicalID': medicalID,
        'prescription': prescription,
        'addedby': addedBy
    }
    ehrRadiologist.addMedicineReport(req, res, doc);
});

router.get('/getprescription', function (req, res) {
    res.render('org/radiologistPortal', {
        details: {},
        error: null,
        message: null
    });
});

router.post('/getprescription', function (req, res) {
    let medicalID = req.body.medicalID;
    let doc = {
        'medicineID': medicalID
    }
    ehrRadiologist.getMedicineRecord(req, res, doc);
});

router.get('/reporthistory', function (req, res) {
    res.render('org/radiologistPortal', {
        details: {},
        error: null,
        message: null
    });
});

router.post('/reporthistory', function (req, res) {
    let medicalID = req.body.medicalID;
    let doc = {
        'medicalID': medicalID
    }
    ehrRadiologist.getRecord(req, res, doc);
});

router.get('/medicinehistory', function (req, res) {
    res.render('org/radiologistPortal', {
        details: {},
        error: null,
        message: null
    });
});

router.post('/medicinehistory', function (req, res) {
    let medicalID = req.body.medicalID;
    let doc = {
        'medicalID': medicalID
    }
    ehrRadiologist.getMedicineRecord(req, res, doc);
});

module.exports = router;