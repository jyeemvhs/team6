function mapToTableRow(obj) {
    return `<tr><td>${obj.name}</td><td>${obj.total}/${obj.max}</td><td><button class="join" id="r-${obj.id}">Join</button></tr>`;
}

function reload() {
    $.ajax({
        url: "/lobbies", 
        type: "GET",
        cache: false,
        headers: {token: localStorage.getItem("token")},
        dataType: "json",
        success: function(data) {
            $("#roomBody").empty();
            console.log(data);

            for (let i = 0; i < data.length; i++) {
                if (!data[i]) continue;
                $("#roomBody").append(mapToTableRow(data[i]));
            }

            $("button.join").click(joinClick); 
        }, error: function() {
            console.warn("Failed to refresh room list");
        }
    });
}

function joinClick() {
    let id = $(this).attr('id');
    
    let roomId = id.substring(2);
    console.log("todo send join req to " + roomId);

    $.ajax({
        url: "/join", 
        type: "GET",
        cache: false,
        headers: {token: localStorage.getItem("token")},
        data: {roomId},
        dataType: "json",
        success: function(data) {
            console.log(data);

            if (data.c) window.location = window.origin + "/canvas?roomId=" + roomId;

        }, error: function() {
            console.log("failed to join or smthin");
        }
    });
}

let intervalId;// = setInterval(reload, 5000);
$(document).ready(function() {
    $("#refresh").click(function() {
        reload();
    });

    let refVal = localStorage.getItem("home:auto-refresh");
    if (!refVal || refVal == "true") {
        $("#pollCheck").attr("checked", true); 
        intervalId = setInterval(reload, 5000);
    } else $("#pollCheck").attr("checked", null);

    $("#pollCheck").change(function() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
            localStorage.setItem("home:auto-refresh", false);
            return;
        }

        intervalId = setInterval(reload, 5000);
        localStorage.setItem("home:auto-refresh", true);
    })

    $("#welcome").text("Welcome, " + localStorage.getItem("username"));

    $("form").submit(function() {
        $.ajax({
            url: "/create-lobby", 
            type: "POST",
            headers: {token: localStorage.getItem("token")},
            data: {name: $("#name").val(), max: $("#max").val(), pass: $("#pass").val()},
            dataType: "json",
            success: function(data) {
                console.log(data);
                window.location = window.origin + "/canvas?roomId=" + data.id;
            }, error: function() {
                console.error("failed to create room");
            }
        })

        return false;
    });

    $("#closeCreate").click(function() {
        $("#createLobby").attr("class", "hide");
        $("#roomList").attr("class", null);
    });
    
    $("#create").click(function() {
        $("#createLobby").attr("class", null);
        $("#roomList").attr("class", "blur");
    });

    reload();
});