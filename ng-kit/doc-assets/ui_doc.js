$(function() {

    var clipboard = new Clipboard('.copy-to-clipboard');

    clipboard.on('success', function(e) {
        var obj = $(e.trigger);
        var default_text = obj.text();
        obj.text('Copied!');
        setTimeout(function () {
            obj.text(default_text);
        }, 2000);
        e.clearSelection();
    });

    // add dimentions of a apps logos to it's name on a copy btn
    $('#apps-logos-set .img-set img').each(function(){
        $(this).on('load', function(){
            $(this).next('.btn').html(  $(this).prop('naturalWidth') + 'x' + $(this).prop('naturalHeight') + ' ' + $(this).next('.btn').html() );
        });
    });
});
