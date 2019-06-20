
var number_of_days = 1;
var sample_percentage = .00001;
 
var default_props = ["$city", "$region", "mp_country_code", "$brand", "$bluetooth_version", "$device", "$os", "$app_release", "$app_version", "$carrier", "$lib_version", "$wifi", "$screen_width", "$screen_height", "$model", "$os_version", "$manufacturer", "$screen_dpi", "$has_telephone", "has_nfc", "$bluetooth_enabled", "$browser", "$initial_referrer", "$initial_referring_domain", "$referrer", "$referring_domain", "$browser_version", "mp_keyword", "$search_engine", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "$radio", "mp_device_model", "$google_play_services", "campaign_id", "message_id", "mp_lib", "message_subtype", "message_type", "$answer_count", "survey_id", "collection_id", "$survey_shown", "$watch_model", "$ios_ifa", "$current_url", "$duration", "$from_binding", "$experiments", "$import", "distinct_id", "time", "$has_nfc", "$app_build_number", "$app_version_string"];
 
var default_events = ['$campaign_delivery', '$campaign_marked_spam', '$campaign_bounced', '$campaign_open', '$experiment_started', '$show_survey', '$ae_crashed', '$ae_first_open', '$ae_session', '$ae_updated', '$campaign_received', '$app_open'];
 
function main() {
  return Events({
    from_date: new Date(new Date().getTime() - (number_of_days * 24 * 60 * 60 * 1000)).toISOString().slice(0, -14),
    to_date:   new Date().toISOString().slice(0, -14),
  })
  .filter(event => Math.random() < sample_percentage)
  .filter(event => !_.contains(default_events, event.name))
  .map(event => ({
    event_name: event.name,
    library: event.properties.mp_lib,
    properties: _.keys(_.omit(event.properties, default_props))
  }))
  .groupBy(['event_name', 'library'], function(accums, items) {
    var result = {};
    _.each(accums, function(accum) {
      result.properties = result.properties || {};
      _.each(_.keys(accum.properties), function(property) {
        result.properties[property] = result.properties[property] + accum.properties[property] || accum.properties[property];
      });
      result.total = result.total + accum.total || accum.total;
    });
    _.each(items, function(item) {
      result.properties = result.properties || {};
      _.each(item.properties, function(property) {
        result.properties[property] = result.properties[property] + 1 || 1;
      });
      result.total = result.total + 1 || 1;
    });
    return result;
  })
  .map(result => ({
      event: result.key[0],
      library: result.key[1],
      count: result.value.total,
      properties: _.mapObject(result.value.properties,
                  count => Math.round(1000 * count / result.value.total) / 10)
  }));
}