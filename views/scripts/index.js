var parser = new UAParser();
var socket = io();

var result = parser.getResult();

if(result.cpu.architecture === undefined || result.cpu.architecture === null){
    result.cpu.architecture = result.os.version;
}

var device = {
    name: result.os.name + " " + result.cpu.architecture,
    browser:result.browser.name,
    engine: result.engine.name + " " + result.engine.version
};


/**
 * Get the user IP throught the webkitRTCPeerConnection
 * @param onNewIP {Function} listener function to expose the IP locally
 * @return undefined
 */
function getUserIP(onNewIP) { //  onNewIp - your listener function for new IPs
    //compatibility for firefox and chrome
    var myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    var pc = new myPeerConnection({
            iceServers: []
        }),
        noop = function() {},
        localIPs = {},
        ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g,
        key;

    function iterateIP(ip) {
        if (!localIPs[ip]) onNewIP(ip);
        localIPs[ip] = true;
    }

    //create a bogus data channel
    pc.createDataChannel("");

    // create offer and set local description
    pc.createOffer().then(function(sdp) {
        sdp.sdp.split('\n').forEach(function(line) {
            if (line.indexOf('candidate') < 0) return;
            line.match(ipRegex).forEach(iterateIP);
        });

        pc.setLocalDescription(sdp, noop, noop);
    }).catch(function(reason) {
        // An error occurred, so handle the failure to connect
    });

    //listen for candidate events
    pc.onicecandidate = function(ice) {
        if (!ice || !ice.candidate || !ice.candidate.candidate || !ice.candidate.candidate.match(ipRegex)) return;
        ice.candidate.candidate.match(ipRegex).forEach(iterateIP);
    };
}





$('#send-message').submit(function(e){
    e.preventDefault();
    socket.emit('send message', $('#message').val());
    $('#message').val('');
});

socket.on('new message', function(data){
    $('#chat').append('<b>' + data.nick + ': </b>' + data.msg + "<br/>");
});

socket.on('connectCounter', function(data){
    $('#connectCounter').empty();
    $('#connectCounter').append(data + " live browsers");
});

var myObject;

function bodyLoaded(bodyData) {
    console.log("Body loaded: ");

    getUserIP(function(private){
        $.getJSON('https://api.ipify.org?format=json', function(public){
            myObject = {
                id: "cookie io os season id",
                name: device.name + " " + device.browser + " " + device.engine,
                privateIp: private,
                publicIp: public.ip,
                shortName: device.name
            };

            socket.emit('new user', myObject, function(data){
                $('#contentWrap').show();
            });
        });
    });
}

socket.on('usernames', function(data){
    var html = '';
    for (var nickname in data) //Foreach all nicknames received in data
    {
        var isNicknameOnline = data[nickname].online //Get the online state

        //We test the online status
        if (isNicknameOnline)
        {
            var status = '<font color=green><b>ON</b></font>'
        }
        else
        {
            var status = '<font color=red><b>OFF</b></font>'
        }

        html += status + ' ' + nickname + '<br/>' //print the status
    }
    $('#users').html(html);
});