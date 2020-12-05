$(document).ready(function() {
    $("#signup").click(function(event) {
        event.preventDefault();

        var name = $("#name").val();
        var email = $("#email").val();
        var phone = $("#phone").val();
        var password = $("#password").val();
        var address = $("#us3-address").val();
        var lat = $("#us3-lat").val();
        var long = $("#us3-lon").val();

        if (!name || !email || !phone || !password || !address) {
            Swal.fire("Error", "All Fields are Required", "error");
            return false;
        }
        var loader = ' <i class="icon-spinner icon-spin"></i>';

        if ($(this).has("i").val() == "") return;

        $(this).append(loader);


        var data = { name, email, phone, password, address, lat, long };
        var request = $.ajax({
            url: "/register",
            type: "POST",
            data: data,
            dataType: "json",
        });

        request.done(function(data) {
            if (data.status === "OK") {
                Swal.fire({
                    type: "success",
                    title: "Registration Successful!",
                    text: "A verification email has been sent to you. Kindly verify you email before you can login!",
                    onClose: () => {
                        $("#name").val("");
                        $("#email").val("");
                        $("#password").val("");
                        $("#phone").val("");
                        $("#us3-address").val("");
                        $("#us3-lat").val("");
                        $("#us3-lon").val("");

                    },
                });
            } else Swal.fire("Error", data.msg, "error");
            $(".icon-spin").remove();
        });

        request.fail(function(data) {
            console.log(data);
            Swal.fire("Error", "Error occured", "error");
            $(".icon-spin").remove();
        });
    });

    $("#login").click(function(event) {
        event.preventDefault();
        var email = $("#lemail").val();
        var password = $("#lpassword").val();

        var loader = ' <i class="icon-spinner icon-spin"></i>';

        if ($(this).has("i").val() == "") return;

        $(this).append(loader);

        if (email == "" || password == "") {
            errorMsg = "Both fields are required";
            $(".icon-spin").remove();
            Swal.fire("Error", errorMsg, "error");
            return;
        }
        var data = { email, password };
        var request = $.ajax({
            url: "/login",
            type: "POST",
            data: data,
            dataType: "json",
        });

        request.done(function(data) {
            if (data.status === "OK") {
                const Toast = Swal.mixin({
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 5000,
                });

                Toast.fire({
                    type: "success",
                    title: "Signed in successfully",
                });
                window.location.href = data.intended;
            } else {
                Swal.fire("Error", data.msg, "error");
                $(".icon-spin").remove();
            }
        });

        request.fail(function(data) {
            Swal.fire("Error", "Error occured", "error");
            console.log(data)
            $(".icon-spin").remove();
        });


    });
});