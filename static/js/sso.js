"use strict"; // Start of use strict

console.log("chatnet script loaded");

async function postData(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        //mode: 'no-cors',
        cache: 'no-cache',
        credentials: 'include',
        headers: {
           'Content-Type': 'application/json'
        },
        redirect: 'follow', 
        referrerPolicy: 'no-referrer',
        body: data 
    });
    
    return response.text();
}
postData("{{ url('sso-login') }}", JSON.stringify(cnUserData)).then(data => {
    setTimeout(function() { 
        var frames = document.getElementsByClassName("chatnet-iframe");
        for (var i = 0; i < frames.length; i++) {
            frames.item(i).src = frames.item(i).src
        }
    }, 1000);
    
});

