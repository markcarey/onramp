(function($) {

    var form = $("#quest-form");
    form.steps({
        headerTag: "h3",
        bodyTag: "fieldset",
        transitionEffect: "fade",
        labels: {
            previous: 'Prev',
            next: 'Next',
            finish: 'Submit',
            current: ''
        },
        titleTemplate: '<h3 class="title">#title#</h3>',
        onStepChanging: function (event, currentIndex, newIndex)
        {
            if(currentIndex === 0) {

                form.find('.content .body .step-current-content').find('.step-inner').removeClass('.step-inner-0');
                form.find('.content .body .step-current-content').find('.step-inner').removeClass('.step-inner-1');
                form.find('.content .body .step-current-content').append('<span class="step-inner step-inner-' + currentIndex + '"></span>');
            }
            if(currentIndex === 1) {
                form.find('.content .body .step-current-content').find('.step-inner').removeClass('step-inner-0').addClass('step-inner-'+ currentIndex + '');
            }
            return true;
        },
        onFinished: function(event, currentIndex) {
            alert('Mission Accomplished');
        }
    });

})(jQuery);