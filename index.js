// Tham chiếu thư viện
var MongoClient = require('mongodb').MongoClient;
// link kết nối đến database
var url = "mongodb+srv://blackeyredheart:PThBX5aTkaJV2C02@cluster0.sfc35kn.mongodb.net/redirect";
// tạo đối tượng và truyền dữ liệu qua url
var mongo = new MongoClient(url, { useNewUrlParser: true });
const axios = require('axios');
// Kết nối đến Database

setInterval(() => {
    mongo.connect((err, db) => {
        if (err) throw err;
        var dbo = db.db("redirect");
        dbo.collection("redirects").find().toArray((err, objs) => {
            if (err) throw err;
            if (objs.length != 0) console.log("Lấy dữ liệu thành công ..... ");
            for (var i = 0; i < objs.length; i++) {
                var endpoint = objs[i].domain;
                var idmd5 = objs[i].idmd5
                checking(endpoint, idmd5, dbo);
            }
        });

    });
}, 3600000);

function checking(endpoint, idmd5, dbo) {
    var startTime = (new Date()).getTime(),
        endTime;
    axios.get(endpoint)
        .then(function(response) {
            // handle success
            console.log();
            if (response.data.status != "404") {
                endTime = (new Date()).getTime();
                var status_link = "status:" + response.status + " / " + 'Took: ' + (endTime - startTime) + 'ms';
                console.log(endpoint + " /==/ " + status_link);
                // update status
                const listingQuery = { idmd5: idmd5 };
                updateStatus(status_link, listingQuery, dbo);
            } else {
                // handle error
                var status_link = "status: 404";
                console.log(endpoint + " /==/ " + status_link);
                // update status
                const listingQuery = { idmd5: idmd5 };
                updateStatus(status_link, listingQuery, dbo);
            }
        })
        .catch(function(error) {
            // handle error
            var status_link = "status:error";
            console.log(endpoint + " /==/ " + status_link);
            // update status
            const listingQuery = { idmd5: idmd5 };
            updateStatus(status_link, listingQuery, dbo);

        })
        .finally(function() {
            // always executed
        });
}

function updateStatus(status_link, listingQuery, dbo) {
    dbo
        .collection("redirects")
        .updateOne(listingQuery, { $set: { status: status_link } }, function(err, _result) {

        });

}