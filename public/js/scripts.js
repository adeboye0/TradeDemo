$("#upload").click(function(event) {
    event.preventDefault();
    var name = $("#name").val();
    var description = $("#desc").val();
    var address = $("#us3-address").val();
    var lat = $("#us3-lat").val();
    var long = $("#us3-lon").val();
    var image = $("#uploadImage")[0].files[0];

    var loader = ' <i class="icon-spinner icon-spin"></i>';

    if ($(this).has("i").val() == "") return;

    $(this).append(loader);

    if (!name || !description || !address || !image) {
        errorMsg = "All fields are required";
        $(".icon-spin").remove();
        Swal.fire("Error", errorMsg, "error");
        return;
    }

    var formData = new FormData();

    formData.append('name', name);
    formData.append('description', description);
    formData.append('address', address);
    formData.append('lat', lat);
    formData.append('long', long);
    formData.append('image', image);

    $.ajax({
        url: '/upload-product',
        type: 'POST',
        data: formData,
        dataType: "json",
        contentType: false,
        processData: false,
    }).done(function(res) {
        if (res.msg) {
            Swal.fire({
                type: res.status,
                title: res.status,
                text: res.msg,
                onClose: () => {
                    window.location.href = "/";
                }
            })
        } else {
            Swal.fire('Error',
                'Error processing your request.',
                'error');
            $(".icon-spin").remove();
        }
    }).fail(function(res) {
        console.log(res)
        Swal.fire('Error',
            'Error processing your request.',
            'error');
        $(".icon-spin").remove();
    });
});

$("#post-comment").click(function(event) {
    event.preventDefault();
    var id = $("#id").val();
    var comment = $("#comment").val();

    var loader = ' <i class="icon-spinner icon-spin"></i>';

    if ($(this).has("i").val() == "") return;

    $(this).append(loader);

    if (!comment) {
        errorMsg = "Input Comment";
        $(".icon-spin").remove();
        Swal.fire("Error", errorMsg, "error");
        return;
    }
    var data = { comment };
    $.ajax({
        url: "/product/comment/" + id,
        type: "POST",
        data: data,
        dataType: "json",
    }).done(function(res) {
        if (res.status == "success") {
            Swal.fire({
                type: res.status,
                title: res.status,
                text: 'Comment Posted',
                onClose: () => {
                    window.location.href = "/product/" + id;
                }
            })
            $(".icon-spin").remove();
        } else {
            Swal.fire('Error',
                'Error processing your request.',
                'error');
            $(".icon-spin").remove();
        }
    }).fail(function(res) {
        console.log(res)
        Swal.fire('Error',
            'Error processing your request.',
            'error');
        $(".icon-spin").remove();
    });

});

$("#post-reply").click(function(event) {
    event.preventDefault();
    var pid = $("#post-id").val();
    var id = $("#comment-id").val();
    var reply = $("#reply").val();
    var phoneNumber = $("#comment-phone").val();
    var email = $("#comment-email").val();

    var loader = ' <i class="icon-spinner icon-spin"></i>';

    if ($(this).has("i").val() == "") return;

    $(this).append(loader);

    if (!reply) {
        errorMsg = "Input Reply";
        $(".icon-spin").remove();
        Swal.fire("Error", errorMsg, "error");
        return;
    }
    var data = { reply, email, phoneNumber };
    $.ajax({
        url: "/product/reply/" + pid + "/" + id,
        type: "POST",
        data: data,
        dataType: "json",
    }).done(function(res) {
        if (res.status == "success") {
            Swal.fire({
                type: res.status,
                title: res.status,
                text: 'Comment Replied',
                onClose: () => {
                    window.location.href = "/product/" + pid;
                }
            })
            $(".icon-spin").remove();
        } else {
            Swal.fire('Error',
                'Error processing your request.',
                'error');
            $(".icon-spin").remove();
        }
    }).fail(function(res) {
        console.log(res)
        Swal.fire('Error',
            'Error processing your request.',
            'error');
        $(".icon-spin").remove();
    });

})