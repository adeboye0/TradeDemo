$("#uploadImage").change(function() {

    var input = this;
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function(e) {
            // console.log(e);
            var img = $('<img class="upload" />');
            img.attr('src', e.target.result);
            $('.image-area').html(img);
        };

        reader.readAsDataURL(input.files[0]);
    }
});