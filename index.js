var http = require('http');

var mongo = require('mongodb').MongoClient;

  var url = process.env.MONGOLAB_URI;


var server = http.createServer();
server.on('request', function(request, response) {
  
  var appAdresi = request.headers.host;
  
  
  if (request.url.substring(0,5) == "/new/")
  {


      
      var verilen = request.url.substring(5, request.url.length);
      console.log(verilen);
      
      
      if (((verilen.substring(0,7) == "http://") || (verilen.substring(0,8) == "https://")) && (verilen.indexOf(".") > verilen.indexOf("//") + 2))
      {
        var tesadufi = makeid();
        var ekle =
        {
        "original_url": verilen,
        "short_url": tesadufi
        };
        
        var denemeObj =
        {
        "original_url": ekle.original_url,
        "short_url": appAdresi + "/" + ekle.short_url
        };
      
        mongo.connect(url, function(err, db) {
          if (err)
          {
            console.log("hata var aga");
            process.exit(1);
          }
        
          var collection = db.collection('denemeConnection');
      
          collection.insert(ekle, function(err, data) {
            if (err)
            {
              console.log("hata var");
            }
            
            console.log(JSON.stringify(ekle));
            
          });
          
          db.close();
        });
      
        response.end(JSON.stringify(denemeObj));
      }
      
      
      else
      {
        response.end("Please enter a valid URL!");
      }
  }


  else if (request.url.length == 1)
  {
    console.log("yonerge");
    var denemeMesaji = "<h1> URL Shortener Microservice </h1>";
    denemeMesaji += "<h3> To shorten: </h3>";
    denemeMesaji += "<p>Pass a URL as a parameter after '/new/' and you will receive a shortened URL in the JSON response. <p>"
    denemeMesaji += "<p> Sample use: " + appAdresi + "/new/https://www.google.com<br><br>";
    denemeMesaji += "<h3> To fetch shortened URL: </h3>";
    denemeMesaji += "<p>Simply visit the URL provided in the JSON response. <p>"
    denemeMesaji +=  "<p> Sample use: " + appAdresi + "YUrX3";
    
    response.end(denemeMesaji);
    
  }
  
  
  else if ((request.url.length == 6 && request.url[5] != '/') || (request.url.length == 7 && request.url[6] == '/'))
  {
    
    var bakilasi = request.url.substring(1, 6);
    console.log("bakacagiz var mi " + bakilasi);
    //console.log("bakacagiz var mi " + request.url.substring(1, 6));
    
        mongo.connect(url, function(err, db) {
            if (err)
            {
              console.log("hata var aga");
              process.exit(1);
            }
          
            var collection = db.collection('denemeConnection');
        
          var yanita = collection.find({
                // "short_url": "QIQXH"
                "short_url": bakilasi
            }).toArray(function(err, documents) {
                if (err)
                {
                  console.log("hata var");
                }
                
        
                // console.log(documents);
                
                if (documents.length == 0)
                {
                  console.log("yokmus aga");
                     response.end("Please provide a valid URL to be shortened!");
                }
                
                else
                {
                  var yonlendirmeye = documents[0].original_url;
                  
                  //console.log(yonlendirmeye);
                  console.log(yonlendirmeye);
                  
                  response.writeHead(302, {
                    'Location' : yonlendirmeye
                  });
                   response.end("redirect olucan mi acaba bebisim, database'imizde varsa sayet " + request.url.substring(1, 6));
                  
                }
        
            });
            
            db.close();
        });
  }
  
  else
  {
    console.log("duzgun gir lam");
    response.end("Please provide a valid URL to be shortened!");
  }
    
});


server.listen(process.env.PORT, function() {
  console.log('Node app is running on port', process.env.PORT);
});


function makeid()
{
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var text = "";

    for ( var i=0; i < 5; i++)
    {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    
    return text;
}