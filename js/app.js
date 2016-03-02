/*This is comment Section
*/
var app = angular.module("typingApp", []);

/**
 * Manages Paragraph used for typing
 * Logic to calculate speed and accuracy
 */
app.factory('Paragraph', function () {

    var paragraph = {};

    paragraph.paragraph = ['' +
    'Մեսրոպ Մաշտոցը, դժվարությամբ դարձի բերելով Գողթն գավառի ժողովրդին, հասկանում է, որ երկրում տիրապետող կրոնական-պաշտամունքային լեզուներով՝ հունարենով և ասորերենով հնարավոր չէ ժողովրդի մեջ տարածել քրիստոնեությունը։ Չնայած արդեն 100 տարի էր անցել քրիստոնեության ընդունումից, ժողովրդի մեծ մասը դեռ պահպանում էր հեթանոսական կրոնն ու սովորույթները։ Մաշտոցը հասկանում է, որ քրիստոնեության դիրքերը հնարավոր է ամրապնդել միայն այն դեպքում, երբ եկեղեցական արարողակարգը տարվի մայրենի լեզվով՝ հայերենով, իսկ դրա համար անհրաժեշտ էր սեփական գրերի ստեղծումը։ Իր մտքերով նա կիսվում է Սահակ Պարթևի հետ, և պարզվում է, որ կաթողիկոսը նույնպես այդպես է կարծում։'];
	
	
	  



    paragraph.getParagraph = function (key) {
        return paragraph.paragraph[key];
    };

    paragraph.getSuccessKeySpan = function (letter) {
        return '<span class="typing-success" ">' + letter + '</span>';
    };

    paragraph.getFailureKeySpan = function (letter) {

        return (letter == " ") ? '<span class="typing-error-bg">' + letter + '</span>' : '<span class="typing-error">' + letter + '</span>';
    };

    paragraph.calculateAccuracy = function (input) {

        var para = paragraph.getParagraph(0).split(" ");
        var words = input.split(" ");

        var successCount = 0;
        var errorCount = 0;
        var inputLength = words.length;

        for (var i = 0; i < inputLength; i++) {
            if (words[i] == para[i]) {
                successCount++;
            } else {
                errorCount++
            }
        }

        return Math.floor((successCount / inputLength) * 100);

    };

    paragraph.calculateSpeed = function (input, time) {

        var speed = {kpm: 0, wpm: 0};

        speed.kpm = Math.floor(input.length / time); //Keys per minute
        speed.wpm = Math.floor(input.split(" ").length / time); //words per minute

        return speed;

    };


    return paragraph;
});


/**
 *
 * This will look for dynamic changes in html and will render it
 */
app.directive('tyRender', function ($compile) {
    return {
        restrict: 'A',
        replace: true,
        link: function (scope, ele, attrs) {
            scope.$watch(attrs.tyRender, function (html) {
                ele.html(html);
                $compile(ele.contents())(scope);
            });
        }
    };
});


/**
 *
 * Typing Directive:
 *
 * This watches for the input provided by user and based on login highlights the color of text
 */

app.directive('tySpeed', function (Paragraph,$window) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {


            /**
             * Disabled Cut Copy and Paste Functions
             */
            element.on('cut copy paste', function (event) {
                $window.alert("Ծանուցում այն մասին , որ դու ք  փորձում եք խորամանկել :)");
                event.preventDefault();
            });

            scope._paragraph = scope.paragraph;
            var paragraph_length = scope._paragraph.length;

            /**
             * Watch for user input
             */
            scope.$watch('userText', function (newVal, oldVal) {

                var input_text_length = newVal.length;

                if (paragraph_length > input_text_length) {

                    if (!scope.timerStatus && input_text_length > 0) {
                        scope.timerStatus = true;
                        scope.startTime();
                    }

                    var replaceString = '';

                    for (var i = 0; i < input_text_length; i++) {

                        var user_letter = newVal[i];
                        var paragraph_letter = scope._paragraph[i];

                        if (paragraph_letter == user_letter) {
                            replaceString += Paragraph.getSuccessKeySpan(paragraph_letter);
                        } else {
                            replaceString += Paragraph.getFailureKeySpan(paragraph_letter);
                        }
                    }

                    scope.paragraph = replaceString + scope._paragraph.slice(input_text_length)

                }

            })
        }
    };
});

/**
 * Main Controller :
 *  - Manages Timer and Result Modal
 */
app.controller('main_controller', ['$scope', 'Paragraph', '$interval', '$window', function ($scope, Paragraph, $interval, $window) {

    var minutes = 1;
    var seconds = 60;
    var startTimer;

    $scope.startTime = function () {
        startTimer = $interval(function () {

            $scope.timer = $scope.timer - 1;
            $scope.minutes = Math.floor($scope.timer / seconds);
            $scope.seconds = $scope.timer % seconds;

            if ($scope.timer <= 0) {
                $scope.stopTime();
                $scope.accuracy = Paragraph.calculateAccuracy($scope.userText);
                $scope.speed = Paragraph.calculateSpeed($scope.userText, minutes);

                $scope.openModal();
            }
        }, 1000);
    };

    $scope.stopTime = function(){
        $interval.cancel(startTimer);
    };


    $scope.resetTest = function () {
        $scope.timerStatus = false;
        $scope.paragraph = Paragraph.getParagraph(0);
        $scope.timer = minutes * seconds;
        $scope.minutes = minutes;
        $scope.seconds = '00';
        $scope.userText = '';
        $scope.speed = {};
        $scope.stopTime();
    };

    $scope.resetTest();


    $scope.openModal = function () {
        $window.jQuery("#result_modal").modal('show');
    };

}]);
