if (localStorage) { //auto log in
    let ct = localStorage.getItem("token");
    if (ct) {
        $.ajax({
            url: "/check-session", 
            type: "GET",
            cache: false,
            headers: {token: ct},
            success: function() {
                window.location = window.origin + "/home";
            }, error: function() {
                localStorage.removeItem("token");
            }
        });
    } 
}


function checkEmpty(s) {
    return !s || s.length == 0 || s.trim().length == 0 || s.trim() == "";
}

function postRequest(data) {
    let rData;

    if (data.responseJSON) rData = data.responseJSON;
    else rData = data;
    console.log(rData);

    if (rData.message) $("#message").text(rData.message);
    else $("#message").text("");

    if (rData.token == null) return;

    console.log("logging in as " + data.username)
    $(".ib").attr('disabled', "true");
    
    localStorage.setItem("username", data.username);
    localStorage.setItem("token", data.token);

    setTimeout(function() {
        window.location = window.origin + "/canvas";
    }, 1000)
}

function postFailure(data) {
    /*
statusCode: {
                400: function() {
                    $("#message").text("Please provide a username and a password!");
                }, 409: function(d) {
                    $("#message").text(d.responseJSON.message);
                }
            },
    */
}

function requestLoginOrCreate(create) {
    let user = $("#username").val();
    let pass = $("#password").val();

    if (checkEmpty(user)) {
        $("#message").text("Please provide a username");
        return false;
    }

    if (checkEmpty(pass)) {
        $("#message").text("Please provide a password");
        return false;
    }

    pass = btoa(pass);

    if (create) {

        $.ajax({
            url: "/new-user", 
            type: "POST", 
            data: {u: user, p: pass},  
            success: postRequest, 
            error: postRequest,
            dataType: "json"
        });
    } else {
        $.ajax({
            url: "/login", 
            type: "POST", 
            data: {u: user, p: pass},
            success: postRequest,
            error: postRequest,
            dataType: "json"
        });
    }

    /*success: function(data) {
                $("#message").text("Login Successful!")
                console.log(data);

                $(".ib").each(function() {
                    $(this).attr('disabled', "true");
                })
                
                localStorage.setItem("username", data.username);
                localStorage.setItem("userId", data.userId);

                setTimeout(function() {
                    window.location = window.origin + "/canvas.html";
                }, 1000)
            }, statusCode: {
                400: function(d) {
                    $("#message").text("Please provide a username and a password!");
                }, 404: function(d) {
                    console.log(d);
                    $("#message").text(d.responseJSON.message);
                }
            }, */

}

$(document).ready(function() {
    $("form").submit(function() {
        requestLoginOrCreate(false);
        return false;
/*
        let user = $("#username").val();
        let pass = $("#password").val();

        if (checkEmpty(user)) {
            $("#message").text("Please provide a username");
            return false;
        }

        if (checkEmpty(pass)) {
            $("#message").text("Please provide a password");
            return false;
        }
        
        pass = btoa(pass);

        $.ajax({
            url: "/login", 
            type: "PUT", 
            data: {u: user, p: pass},  
            success: function(data) {
                $("#message").text("Login Successful!")
            }, statusCode: {
                400: function() {
                    $("#message").text("Please provide a username and a password!");
                }, 401: function() {
                    $("#message").text("User not found");
                }
            }, dataType: "json"
        });

        return false;*/
    });

    $("#switch").click(function() {
        requestLoginOrCreate(true);
    });
}); // cache the username and userid into local storage for future use