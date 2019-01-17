# 2-Immerse logging infrastructure

This provides a mechanism for logging events and messages within the services and client components in such a way that we can relatively 
easy aggregate them in the Elasticsearch data store and then query and visualise them using Kibana. Logstash is used to filter incoming log messages and
extract key elements as fields.

## Quick Start

The easiest way to browse logs is within the Kibana tool, which you'll find here:
https://platform.2immerse.eu/kibana

Kibana lets you choose from its main modes on the top bar. It starts up by default in *Discover*, where you can use pre-defined filters, or ones you enter yourself, 
to show log data. Make sure that you use the *time filter* in the top right to select the time period for the logs you want to look at. It defaults to the
last 15 mins, so you may have to change it if you're not seeing anything.

## Kibana guidelines

* *Pre-defined searches:* When you open Kibana, the Discover page will default to showing all available logs. It is strongly recommended that you use pre-defined 
searches to filter what you see and how it is presented. Click the 'Open' icon on the far right hand side beneath the time picker, then choose *All 2-Immerse Logs*. 
This will filter on the '2-Immerse' prefix, showing a subset of relevant columns sorted in ascending order so that you can see time progressing. 
It is currently set to sort by sourcetime because this has millisecond granularity.
* *Auto-refresh:* If you want Kibana to automatically update at regular intervals, you can enable Auto-Refresh in the time picker (top right). Select a refresh 
interval and a play/pause button will appear on the top bar so that you can easily temporarily disable it.
* *Dashboards:* Dashboards (accessed from the top bar) can be used to show multiple linked data visualisations. Again, click the 'Open' icon to load a saved dashboard
and select '2-Immerse Sanity Check Dashboard' as an example. For your selected time period, this shows which log sources were active, and all the unique values of
contextID, dmappID and deviceID which were in use.

## Known Issues
* If (eg.) contextID is given twice, once in the REST API and once as a separate term contextID:, it will be duplicated in the contextID field.

## Design details

The design rationale for logging is as follows:
* All logs from 2-Immerse services are received by Logstash via syslog messages which are sent from Mantl workers. A new syslog message is created for each new line sent to stdout in each of the workers’ sandboxes. 
* The stdout line is copied into the 'message' field. The other syslog fields (timestamp, priority etc) are formed around it (so we can't control them).
* Logs can be sent from clients via the Logging Service, a lightweight service running in Mantl which flattens a JSON structure sent via HTTP POST and pushes it to stdout. 
* The HTTP requests which form actions on a particular service’s REST API already encode a lot of information in a compact format. To make life easier, services can just push these request strings to stdout and Logstash will parse them for us.
* We are currently working on the basis that only the receiver (the callee) logs incoming REST API calls.
* Services can also send other log messages which aren’t related to REST API calls.
* All log messages are prefixed with '2-Immerse', which allows them to be distinguished from all the other syslog traffic in the system (because there is currently a LOT of other syslog traffic in the system!)

## Log format

### Service logs
Log messages from services currently use the following format, sent to stdout:

Two examples: 
```
2-Immerse api:<REST API call> body:'<JSON data>' source:LayoutService subSource:MyModule level:Debug sourcetime:2016-10-19T12:01:45.000Z
2-Immerse contextID:<GUID> dmappID:<GUID> deviceID:<GUID> logmessage:'<Log messsage>' body:'<JSON data>' source:LayoutService subSource:MyModule level:Debug sourcetime:2016-10-19T12:01:45.000Z
```

Note:
* All fields are optional, but it is highly advisable to include at least a REST API call or logmesssage, plus a source and sourcetime.
* If REST API call is included, the contextID, dmappID and deviceID are extracted from it (if available). If any of these are not included in the URL, they can be provided separately.
* The angle braces <> are just for illustration - don't include them in real messages!
* The body and logmessage fields must be enclosed in single quotes. Any and all punctuation can be included within these fields, but all single quotes should be escaped with a backslash.


### Client logs
Log messages are sent in JSON format using an HTTP POST to http://logging-service.2immerse.advdev.tv/post. 
A single log message can be sent, or an array of messages in a single POST.

Single message structure:
```
{
  "api":"<REST API call>",
  "body":"<JSON data>",
  "source":"LayoutService",
  "subSource":"MyModule",
  "level":"Debug",
  "sourcetime":"2016-10-26T12:01:45.000Z"
}
```
Array message structure:
```
{ "logArray": 
  [
    {
      "api":"<REST API call>",
      "body":"<JSON data>",
      "source":"LayoutService",
      "subSource":"MyModule",
      "level":"Debug",
      "sourcetime":"2016-10-26T12:01:45.000Z"
    },
    {
      "contextID":"<GUID>",
      "dmappID":"<GUID>",
      "deviceID":"<GUID>",
      "logmessage":"<Log message>",
      "body":"<JSON data>",
      "source":"LayoutService",
      "subSource":"MyModule",
      "level":"Debug",
      "sourcetime":"2016-10-26T12:01:45.000Z"
    }
  ]
}
```

## Licence and Authors

All code and documentation is licensed by the original author and contributors under the Apache License v2.0:

* Cisco an/or its affiliates

<img src="https://2immerse.eu/wp-content/uploads/2016/04/2-IMM_150x50.png" align="left"/><em>This project was originally developed as part of the <a href="https://2immerse.eu/">2-IMMERSE</a> project, co-funded by the European Commission’s <a hef="http://ec.europa.eu/programmes/horizon2020/">Horizon 2020</a> Research Programme</em>

See AUTHORS file for a full list of individuals and organisations that have
contributed to this code.


