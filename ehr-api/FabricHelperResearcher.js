var Fabric_Client = require('fabric-client');
var path = require('path');
var util = require('util');
var os = require('os');
var member_user = null;
var store_path = path.join(__dirname, 'hfc-key-store');
var tx_id = null;
var fs = require('fs')

let allusersrecords = new Array()

async function getAllUsers(req, res, enabledUsers){
    for(let i = 0; i<enabledUsers.length; i++){
        getRecord(enabledUsers[i])
    }
    setTimeout(() => {
        var file = fs.createWriteStream('data.txt');
        file.on('error', function(err) { console.log(err) });
        allusersrecords.forEach(value => { file.write(`${value}\r\n`) });
        file.end();
    }, 10000)
    setTimeout(() => {
        res.download('data.txt')
    }, 20000)
}

async function getRecord(medicalID) {
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
                //console.log("Successfully loaded clinicianUser from persistence");
                member_user = user_from_store;
            } else {
                throw new Error("Failed to get clinicianUser.... run registerUser.js");
            }

            // getRecord chaincode function - requires 1 argument, ex: args: ['ABCD'],
            var request = {
                chaincodeId: 'ehrcc',
                fcn: 'getRecord',
                args: [medicalID],
                chainId: 'ehrchannel'
            };

            // send the query proposal to the peer
            return channel.queryByChaincode(request);
        })
        .then(query_responses => {
            //console.log("Query has completed, checking results");
            // query_responses could have more than one  results if there multiple peers were used as targets
            if (query_responses && query_responses.length == 1) {
                if (query_responses[0] instanceof Error) {
                    console.error("error from query = ", query_responses[0]);
                } else {
                    //console.log("Response is ", query_responses[0].toString());
                    //console.log(query_responses[0].toString())
                    allusersrecords.push(query_responses[0].toString())
                    //return query_responses[0].toString()
                    //console.log(typeof (result));
                    //return result.toString()
                }
            } else {
                console.log("No payloads were returned from query");
                // res.render("org/hcpPortal", {
                //     details: {},
                //     error: res.__('messages.noPresc')
                // });
            }
        })
        .catch(err => {
            console.error("Failed to query successfully :: " + err);
            // res.render("org/hcpPortal", {
            //     details: result,
            //     error: res.__('messages.error')
            // });
        });
}

let ehrResearcher = {
    getRecord : getRecord,
    getAllUsers: getAllUsers
}
module.exports = ehrResearcher