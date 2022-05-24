import { Log } from "./Log";

const yml = require('yml');

export class Util {

  /**
   * Laden einer Configdatei. Dabei wird auch ein Umgebungsvariable berücksichtigt, die den Pfad auf die Datei angibt
   * Please mind: In OSCP the filename (part of configmap) is named "upstreammon-config.yaml" instead of the local "config.yaml"
   */
  public static loadConfig() {
    let target: string;

    if (process.env.CONFIGPATH) {
      target = process.env.CONFIGPATH + '/upstreammon-config.yaml';
    } else {
      target = `${__dirname}/../../config/config.yaml`;
    }

    Log.debug(`loading config ${target}`);
    return yml.load(target, 'utf8');
  }

  public static loadHostConfig() {
    let target: string;

    if (process.env.CONFIGPATH) {
      target = process.env.CONFIGPATH + '/upstreammon-hosts-config.yaml';
    } else {
      target = `${__dirname}/../../config/config-hosts.yaml`;
    }

    Log.debug(`loading config ${target}`);
    const config = yml.load(target, 'utf8');

    return config
  }
}