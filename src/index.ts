import { App } from "./lib/App";
new App();

/*********************************************************************
  Hinweis System Ctrl:
    Konfiguration in /lib/systemd/system/timetracker-mon.service

    Anwendung
  sudo systemctl stop timetracker-mon
  sudo systemctl start timetracker-mon
  sudo systemctl restart timetracker-mon
*********************************************************************/