export class HostConfig {
   public enable = false;
   public id = "";
   public workspace = "";
   public schedule = 0;
   public timeout = 5000;
   public protocol = "https";
   public baseUrl = "";
   public url = "";
   public name = "";
   public method = "get";
   public ignoreSSL = true;
   public headers = "";
   public concurrent = 0;
   public model: Model = new Model();
}
export class Model {
   public type = "plain";
   public probes = 10; // number of threads / probes
   public attackTime = 0; // time in seconds to reach full load
   public sustainTime = 10; // time in seconds to keep full load
   public releaseTime = 0; // time in seconds to go back to zero load
}