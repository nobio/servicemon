export class HttpStatusCodes {

   private HTTP_STATUS_CODES = [
      { code: "100", statusText: "Continue" },
      { code: "101", statusText: "Switching Protocols" },
      { code: "102", statusText: "Processing" },
      { code: "200", statusText: "OK" },
      { code: "201", statusText: "Created" },
      { code: "202", statusText: "Accepted" },
      { code: "203", statusText: "Non Authoritative Information" },
      { code: "204", statusText: "No Content" },
      { code: "205", statusText: "Reset Content" },
      { code: "206", statusText: "Partial Content" },
      { code: "207", statusText: "Multi-Status" },
      { code: "300", statusText: "Multiple Choices" },
      { code: "301", statusText: "Moved Permanently" },
      { code: "302", statusText: "Moved Temporarily" },
      { code: "303", statusText: "See Other" },
      { code: "304", statusText: "Not Modified" },
      { code: "305", statusText: "Use Proxy" },
      { code: "307", statusText: "Temporary Redirect" },
      { code: "308", statusText: "Permanent Redirect" },
      { code: "400", statusText: "Bad Request" },
      { code: "401", statusText: "Unauthorized" },
      { code: "402", statusText: "Payment Required" },
      { code: "403", statusText: "Forbidden" },
      { code: "404", statusText: "Not Found" },
      { code: "405", statusText: "Method Not Allowed" },
      { code: "406", statusText: "Not Acceptable" },
      { code: "407", statusText: "Proxy Authentication Required" },
      { code: "408", statusText: "Request Timeout" },
      { code: "409", statusText: "Conflict" },
      { code: "410", statusText: "Gone" },
      { code: "411", statusText: "Length Required" },
      { code: "412", statusText: "Precondition Failed" },
      { code: "413", statusText: "Request Entity Too Large" },
      { code: "414", statusText: "Request-URI Too Long" },
      { code: "415", statusText: "Unsupported Media Type" },
      { code: "416", statusText: "Requested Range Not Satisfiable" },
      { code: "417", statusText: "Expectation Failed" },
      { code: "418", statusText: "I'm a teapot" },
      { code: "419", statusText: "Insufficient Space on Resource" },
      { code: "420", statusText: "Method Failure" },
      { code: "422", statusText: "Unprocessable Entity" },
      { code: "423", statusText: "Locked" },
      { code: "424", statusText: "Failed Dependency" },
      { code: "428", statusText: "Precondition Required" },
      { code: "429", statusText: "Too Many Requests" },
      { code: "431", statusText: "Request Header Fields Too Large" },
      { code: "500", statusText: "Server Error" },
      { code: "501", statusText: "Not Implemented" },
      { code: "502", statusText: "Bad Gateway" },
      { code: "503", statusText: "Service Unavailable" },
      { code: "504", statusText: "Gateway Timeout" },
      { code: "505", statusText: "HTTP Version Not Supported" },
      { code: "507", statusText: "Insufficient Storage" },
      { code: "511", statusText: "Network Authentication Required" },
   ];
   /**
     * return the http-status code object, regardles if it is the numeric or alphanumeric value
     * @param {*} httpStatus http status code
     * @returns status code object
     */
   public translateCodeToText(httpStatusCode: string): string {
      let statusCodeText = 'n.a';
      // status code is numeric -> check if this number is a valid status code
      this.HTTP_STATUS_CODES.forEach(httpStatusCodeObj => {
         if (httpStatusCodeObj.code === httpStatusCode) statusCodeText = httpStatusCodeObj.statusText;
      });
      return statusCodeText;
   }

}