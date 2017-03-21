let counter = 0;
const queuedCalls = [];
const activeCalls = [];

/**
 * Makes an AJAX call to a provided endpoint using a provided HTTP method,
 * logs results to console. Manipulates DOM according to response.
 */
function ajaxCall() {
  if (queuedCalls.length !== 0) {
    if (activeCalls.length < 5) {
      let currentCall = queuedCalls.pop();
      activeCalls.push(currentCall);
      $.ajax({
        url: currentCall.url,
        method: currentCall.method,
        tryCount: 0,

        /**
         * Success callback for 200 response
         * Modifies the DOM to indicate a successful call was made
         * @callback success
         * @param  {Object} res Response object containing JSON data
         */
        success(res) {
          $('#status').text('AJAX call succeeded!');
          $('#ajaxResponse').text(JSON.stringify(res));
          activeCalls.splice(-1, 1);
          ajaxCall();
        },

        /**
         * Error callback if the response is not 200
         * We can retry the same AJAX call nicely by just passing 'this' to
         * the AJAX function if our counter is below 3
         * Modifies the DOM to show the user what is happening
         * @callback error
         * @param  {Object} xhr     jqXHR object
         * @param  {String} errType String of the type of error encountered
         */
        error(xhr, errType) {
          this.tryCount += 1;
          if (this.tryCount < 3) {
            $('#status').text('AJAX call failed, retrying...');
            $.ajax(this);
          } else {
            $('#status').text('AJAX call failed 3 times, stopping.');
            $('#ajaxResponse').text(errType);
            activeCalls.splice(-1, 1);
            ajaxCall();
          }
        },

        /**
         * Callback that executes regardless of success or failure
         * Modifies the DOM to show total number of AJAX requests made
         * @callback complete
         */
        complete() {
          counter += 1;
          $('#callCount').text(counter);
        },
      });
    }
  }
}

/**
 * Adds an object containing the call's URL and method to a queue of calls
 * Calls the recursive ajaxCall function
 * @param  {String} url    API endpoint
 * @param  {String} method HTTP method - GET, PUT, POST, DELETE
 */
function enqueueAjax(url, method) {
  if ($('#url').val() !== '') {
    queuedCalls.push({ url, method });
    ajaxCall();
  }
}
