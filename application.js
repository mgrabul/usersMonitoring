{/* <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
<script src="https://www.gstatic.com/firebasejs/4.5.0/firebase.js"></script>
<script  type="text/javascript"> */}
{/* Initialize Firebase */ }

// </script>
function MonitorApp() {
    var setOfUsers = {};
    var CURRENT_USER_KEY;
    var refreshInterval;
    var Base64 = { _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) { var t = ""; var n, r, i, s, o, u, a; var f = 0; e = Base64._utf8_encode(e); while (f < e.length) { n = e.charCodeAt(f++); r = e.charCodeAt(f++); i = e.charCodeAt(f++); s = n >> 2; o = (n & 3) << 4 | r >> 4; u = (r & 15) << 2 | i >> 6; a = i & 63; if (isNaN(r)) { u = a = 64 } else if (isNaN(i)) { a = 64 } t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a) } return t }, decode: function (e) { var t = ""; var n, r, i; var s, o, u, a; var f = 0; e = e.replace(/[^A-Za-z0-9+/=]/g, ""); while (f < e.length) { s = this._keyStr.indexOf(e.charAt(f++)); o = this._keyStr.indexOf(e.charAt(f++)); u = this._keyStr.indexOf(e.charAt(f++)); a = this._keyStr.indexOf(e.charAt(f++)); n = s << 2 | o >> 4; r = (o & 15) << 4 | u >> 2; i = (u & 3) << 6 | a; t = t + String.fromCharCode(n); if (u != 64) { t = t + String.fromCharCode(r) } if (a != 64) { t = t + String.fromCharCode(i) } } t = Base64._utf8_decode(t); return t }, _utf8_encode: function (e) { e = e.replace(/rn/g, "n"); var t = ""; for (var n = 0; n < e.length; n++) { var r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r) } else if (r > 127 && r < 2048) { t += String.fromCharCode(r >> 6 | 192); t += String.fromCharCode(r & 63 | 128) } else { t += String.fromCharCode(r >> 12 | 224); t += String.fromCharCode(r >> 6 & 63 | 128); t += String.fromCharCode(r & 63 | 128) } } return t }, _utf8_decode: function (e) { var t = ""; var n = 0; var r = c1 = c2 = 0; while (n < e.length) { r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r); n++ } else if (r > 191 && r < 224) { c2 = e.charCodeAt(n + 1); t += String.fromCharCode((r & 31) << 6 | c2 & 63); n += 2 } else { c2 = e.charCodeAt(n + 1); c3 = e.charCodeAt(n + 2); t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63); n += 3 } } return t } }

    var printViewCallback;
    var userEmail;
    var userData;
    this.initApp = function () {
        var userMonitoringConfigApp = new UserMonitoringConfigApp();
        userMonitoringConfigApp.initApp();
    }

    this.initMonitoring = function (email, name, refreshInterval, userListCallback) {
        userEmail = email;
        userData = name;

        this.initApp();
        this.refreshInterval = refreshInterval;
        printViewCallback = userListCallback;
        var url = window.location.href.split('?')[0];
        this.listenForChange(url);
        var commentsRef = firebase.database().ref('chanel/' + replaceSlashString(Base64.encode(url)));
        commentsRef.once('value', function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                if (childSnapshot.val().email == userEmail) {
                    CURRENT_USER_KEY = childSnapshot.key;
                }
            });
            if (!CURRENT_USER_KEY)
                writeUserDataEncode(userData, userEmail, url);
            setInterval(function () {
                updateUserTimestamp(url);
            }, refreshInterval);
        })
    }

    this.listenForChange = function (url) {
        var commentsRef = firebase.database().ref('chanel/' + replaceSlashString(Base64.encode(url)));
        commentsRef.on('child_added', function (data) {
            setOfUsers[data.val().email] = data.val();
            clearUserSet(setOfUsers, data.val());
            printViewCallback(setOfUsers);
        });

        commentsRef.on('child_changed', function (data) {
            setOfUsers[data.val().email] = data.val();
            clearUserSet(setOfUsers, data.val());
            printViewCallback(setOfUsers);
        });

        commentsRef.on('child_removed', function (data) {
            delete setOfUsers[data.val().email];
            clearUserSet(setOfUsers, data.val());
            printViewCallback(setOfUsers);
        });
    }

    var clearUserSet = function (userSet, item) {
        for (var key in userSet) {
            if (userSet.hasOwnProperty(key)) {
                if (userSet[key].updatedAt < item.updatedAt - 10000 && key != item.userEmail) {
                    delete userSet[key];
                }
            }
        };
    }
    var updateUserTimestamp = function (url) {
        var rootRef = firebase.database().ref();
        var currentUserData = rootRef.child('chanel').child(replaceSlashString(Base64.encode(url))).child(CURRENT_USER_KEY);
        var db = firebase.database();
        if (CURRENT_USER_KEY) {
            var userData = firebase.database().ref("chanel/" + replaceSlashString(Base64.encode(url)))
            userData.once('value',function(snapshot){
                if(snapshot.hasChild(CURRENT_USER_KEY)){
                    db.ref("chanel/" + replaceSlashString(Base64.encode(url)) + "/" + CURRENT_USER_KEY).update({ updatedAt: firebase.database.ServerValue.TIMESTAMP });
                }else{
                    writeUserDataEncode(userData, userEmail, url);                    
                }
                
            });
        }
    }

    var writeUserDataEncode = function (name, email, url) {
        console.log(name+"")
        CURRENT_USER_KEY = firebase.database().ref('chanel/' + replaceSlashString(Base64.encode(url))).push({
            username: name,
            email: email,
            url: url,
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        }).key;
    }
    var writeUserDataNormal = function (name, email, url) {
        firebase.database().ref('chanel/' + url).push({
            username: name,
            email: email,
            url: url,
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        });
    }
    var replaceSlashString = function (str) {
        return str.replace(new RegExp('/'), '+%S%E%X+');
    }
    var deleteKey = function (key, url) {
        firebase.database().ref('chanel/' + replaceSlashString(Base64.encode(url)) + "/" + key).remove();
    }
}
