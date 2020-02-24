console.log('Client-side code running');

const button = document.getElementById('myButton');
button.addEventListener('click', function (e) {
    console.log('button was clicked');

    fetch('/clicked', { method: 'POST' })
        .then(function (response) {
            if (response.ok) {
                console.log('click was recorded');
                return;
            }
            throw new Error('Request failed.');
        })
        .catch(function (error) {
            console.log(error);
        });
});

setInterval(function () {
    fetch('/clicks', { method: 'GET' })
        .then(function (response) {
            if (response.ok) return response.json();
            throw new Error('Request failed.');
        })
        .then(function (data) {
            document.getElementById('counter').innerHTML = `Button was clicked ${data.length} times`;
        })
        .catch(function (error) {
            console.log(error);
        });
}, 1000);

$(document).ready(function () {
    $("img").on("click", function (event) {
        bounds = this.getBoundingClientRect();
        var left = bounds.left;
        var top = bounds.top;
        var x = event.pageX - left;
        var y = event.pageY - top;
        var cw = this.clientWidth
        var ch = this.clientHeight
        var iw = this.naturalWidth
        var ih = this.naturalHeight
        var px = x / cw * iw
        var py = y / ch * ih
        //console.log("click on " + this.tagName + " at pixel (" + px + "," + py + ") mouse pos (" + x + "," + y + ") relative to boundingClientRect at (" + left + "," + top + ") client image size: " + cw + " x " + ch + " natural image size: " + iw + " x " + ih);

        var data = {event: "event", match: "match", robot: "robot", action: "move", location: `${px},${py}`};
        console.log(data);
    });
});