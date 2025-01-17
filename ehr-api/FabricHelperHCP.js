'use strict';
/*
 * Copyright IBM Corp All Rights Reserved
 *
 * SPDX-License-Identifier: Apache-2.0
 */
/*
 * Chaincode Invoke
 */

var Fabric_Client = require('fabric-client');
var path = require('path');
var util = require('util');
var os = require('os');
var member_user = null;
var store_path = path.join(__dirname, 'hfc-key-store');
console.log('Store path:' + store_path);
var tx_id = null;


function getReport(req, res, doc) {
    //Init fabric client
    var fabric_client = new Fabric_Client();

    // setup the fabric network
    var channel = fabric_client.newChannel("ehrchannel");
    var order = fabric_client.newOrderer("grpc://192.168.99.100:7050");
    channel.addOrderer(order);

    //add buyer peer
    var peer = fabric_client.newPeer("grpc://192.168.99.100:9051");
    channel.addPeer(peer);

    Fabric_Client.newDefaultKeyValueStore({
            path: store_path
        })
        .then(state_store => {
            // assign the store to the fabric client
            fabric_client.setStateStore(state_store);
            var crypto_suite = Fabric_Client.newCryptoSuite();
            // use the same location for the state store (where the users' certificate are kept)
            // and the crypto store (where the users' keys are kept)
            var crypto_store = Fabric_Client.newCryptoKeyStore({
                path: store_path
            });
            crypto_suite.setCryptoKeyStore(crypto_store);
            fabric_client.setCryptoSuite(crypto_suite);

            // get the enrolled user from persistence, this user will sign all requests
            return fabric_client.getUserContext("clinicianUser", true);
        })
        .then(user_from_store => {
            if (user_from_store && user_from_store.isEnrolled()) {
                console.log("Successfully loaded clinicianUser from persistence");
                member_user = user_from_store;
            } else {
                throw new Error("Failed to get clinicianUser.... run registerUser.js");
            }

            // getReport chaincode function - requires 1 argument, ex: args: ['ABCD'],
            var request = {
                chaincodeId: 'ehrcc',
                fcn: 'getReport',
                args: [doc.medicalID],
                chainId: 'ehr'
            };

            // send the query proposal to the peer
            return channel.queryByChaincode(request);
        })
        .then(query_responses => {
            console.log("Query has completed, checking results");
            // query_responses could have more than one  results if there multiple peers were used as targets
            if (query_responses && query_responses.length == 1) {
                if (query_responses[0] instanceof Error) {
                    console.error("error from query = ", query_responses[0]);
                    res.render("org/hcpPortal", {
                        details: result,
                        error: res.__('messages.error')
                    });
                } else {
                    console.log("Response is ", query_responses[0].toString())
                    var result = JSON.parse(query_responses[0]);
                    res.render("org/hcpPortal", {
                        details: result,
                        error: null
                    })
                }
            } else {
                console.log("No payloads were returned from query");
                res.render("org/hcpPortal", {
                    details: result,
                    error: res.__('messages.noReport')
                });
            }
        })
        .catch(err => {
            console.error("Failed to query successfully :: " + err);
            res.render("org/hcpPortal", {
                details: result,
                error: res.__('messages.error')
            });
        });
}


//Function to get the entire history of medical reports
function getRecord(req, res, doc) {
    //Init fabric client
    var fabric_client = new Fabric_Client();

    // setup the fabric network
    var channel = fabric_client.newChannel("ehrchannel");
    var order = fabric_client.newOrderer("grpc://192.168.99.100:7050");
    channel.addOrderer(order);

    //add buyer peer
    var peer = fabric_client.newPeer("grpc://192.168.99.100:7051");
    channel.addPeer(peer);

    Fabric_Client.newDefaultKeyValueStore({
            path: store_path
        })
        .then(state_store => {
            // assign the store to the fabric client
            fabric_client.setStateStore(state_store);
            var crypto_suite = Fabric_Client.newCryptoSuite();
            // use the same location for the state store (where the users' certificate are kept)
            // and the crypto store (where the users' keys are kept)
            var crypto_store = Fabric_Client.newCryptoKeyStore({
                path: store_path
            });
            crypto_suite.setCryptoKeyStore(crypto_store);
            fabric_client.setCryptoSuite(crypto_suite);

            // get the enrolled user from persistence, this user will sign all requests
            return fabric_client.getUserContext("clinicianUser", true);
        })
        .then(user_from_store => {
            if (user_from_store && user_from_store.isEnrolled()) {
                console.log("Successfully loaded clinicianUser from persistence");
                member_user = user_from_store;
            } else {
                throw new Error("Failed to get clinicianUser.... run registerUser.js");
            }

            // getRecord chaincode function - requires 1 argument, ex: args: ['ABCD'],
            var request = {
                chaincodeId: 'ehrcc',
                fcn: 'getRecord',
                args: [doc.medicalID],
                chainId: 'ehrchannel'
            };

            // send the query proposal to the peer
            return channel.queryByChaincode(request);
        })
        .then(query_responses => {
            console.log("Query has completed, checking results");
            // query_responses could have more than one  results if there multiple peers were used as targets
            if (query_responses && query_responses.length == 1) {
                if (query_responses[0] instanceof Error) {
                    console.error("error from query = ", query_responses[0]);
                } else {
                    console.log("Response is ", query_responses[0].toString());
                    var result = JSON.parse(query_responses[0]);
                    console.log(typeof (result));
                    res.render("org/hcpPortal", {
                        details: result,
                        error: null
                    });
                }
            } else {
                console.log("No payloads were returned from query");
                res.render("org/hcpPortal", {
                    details: {},
                    error: res.__('messages.noPresc')
                });
            }
        })
        .catch(err => {
            console.error("Failed to query successfully :: " + err);
            res.render("org/hcpPortal", {
                details: result,
                error: res.__('messages.error')
            });
        });
}

function getMedicineReport(req, res, doc) {
    //Init fabric client
    var fabric_client = new Fabric_Client();

    // setup the fabric network
    var channel = fabric_client.newChannel("ehrchannel");
    var order = fabric_client.newOrderer("grpc://192.168.99.100:7050");
    channel.addOrderer(order);

    //add buyer peer
    var peer = fabric_client.newPeer("grpc://192.168.99.100:9051");
    channel.addPeer(peer);

    Fabric_Client.newDefaultKeyValueStore({
            path: store_path
        })
        .then(state_store => {
            // assign the store to the fabric client
            fabric_client.setStateStore(state_store);
            var crypto_suite = Fabric_Client.newCryptoSuite();
            // use the same location for the state store (where the users' certificate are kept)
            // and the crypto store (where the users' keys are kept)
            var crypto_store = Fabric_Client.newCryptoKeyStore({
                path: store_path
            });
            crypto_suite.setCryptoKeyStore(crypto_store);
            fabric_client.setCryptoSuite(crypto_suite);

            // get the enrolled user from persistence, this user will sign all requests
            return fabric_client.getUserContext("clinicianUser", true);
        })
        .then(user_from_store => {
            if (user_from_store && user_from_store.isEnrolled()) {
                console.log("Successfully loaded clinicianUser from persistence");
                member_user = user_from_store;
            } else {
                throw new Error("Failed to get clinicianUser.... run registerUser.js");
            }

            var request = {
                chaincodeId: 'ehrcc',
                fcn: 'getReport',
                args: [doc.medicalID],
                chainId: 'ehr'
            };

            // send the query proposal to the peer
            return channel.queryByChaincode(request);
        })
        .then(query_responses => {
            console.log("Query has completed, checking results");
            // query_responses could have more than one  results if there multiple peers were used as targets
            if (query_responses && query_responses.length == 1) {
                if (query_responses[0] instanceof Error) {
                    console.error("error from query = ", query_responses[0]);
                    res.render("org/hcpPortal", {
                        details: {},
                        error: res.__('messages.error')
                    });
                } else {
                    //console.log("Response is ", query_responses[0].toString())
                    var result = JSON.parse(query_responses[0]);
                    console.log(typeof (result));
                    console.log(result);
                    res.render("org/hcpPortal", {
                        details: result,
                        error: null
                    });
                }
            } else {
                console.log("No payloads were returned from query");
                res.render("org/hcpPortal", {
                    details: {},
                    error: res.__('messages.noReport')
                });
            }
        })
        .catch(err => {
            console.error("Failed to query successfully :: " + err);
            res.render("org/hcpPortal", {
                details: result,
                error: res.__('messages.error')
            });;
        });
}

//Get entire history of prescriptions
function getMedicineRecord(req, res, doc) {
    //Init fabric client
    var fabric_client = new Fabric_Client();

    // setup the fabric network
    var channel = fabric_client.newChannel("ehrchannel");
    var order = fabric_client.newOrderer("grpc://192.168.99.100:7050");
    channel.addOrderer(order);

    //add buyer peer
    var peer = fabric_client.newPeer("grpc://192.168.99.100:7051");
    channel.addPeer(peer);

    Fabric_Client.newDefaultKeyValueStore({
            path: store_path
        })
        .then(state_store => {
            // assign the store to the fabric client
            fabric_client.setStateStore(state_store);
            var crypto_suite = Fabric_Client.newCryptoSuite();
            // use the same location for the state store (where the users' certificate are kept)
            // and the crypto store (where the users' keys are kept)
            var crypto_store = Fabric_Client.newCryptoKeyStore({
                path: store_path
            });
            crypto_suite.setCryptoKeyStore(crypto_store);
            fabric_client.setCryptoSuite(crypto_suite);

            // get the enrolled user from persistence, this user will sign all requests
            return fabric_client.getUserContext("clinicianUser", true);
        })
        .then(user_from_store => {
            if (user_from_store && user_from_store.isEnrolled()) {
                console.log("Successfully loaded clinicianUser from persistence");
                member_user = user_from_store;
            } else {
                throw new Error("Failed to get clinicianUser.... run registerUser.js");
            }
            var request = {
                chaincodeId: 'ehrcc',
                fcn: 'getRecord',
                args: [doc.medicalID],
                chainId: 'ehrchannel'
            };

            // send the query proposal to the peer
            return channel.queryByChaincode(request);
        })
        .then(query_responses => {
            console.log("Query has completed, checking results");
            // query_responses could have more than one  results if there multiple peers were used as targets
            if (query_responses && query_responses.length == 1) {
                if (query_responses[0] instanceof Error) {
                    console.error("error from query = ", query_responses[0]);
                } else {
                    console.log("Response is ", query_responses[0].toString());
                    var result = JSON.parse(query_responses[0]);
                    res.render("org/hcpPortal", {
                        details: result,
                        error: null
                    });
                }
            } else {
                console.log("No payloads were returned from query");
                res.render("org/hcpPortal", {
                    details: {},
                    error: res.__('messages.noPresc')
                });
            }
        })
        .catch(err => {
            console.error("Failed to query successfully :: " + err);
            res.render("org/hcpPortal", {
                details: result,
                error: res.__('messages.error')
            });
        });
}

let ehrHCP = {
    getReport: getReport,
    getRecord: getRecord,
    getMedicineReport: getMedicineReport,
    getMedicineRecord: getMedicineRecord
}

module.exports = ehrHCP;