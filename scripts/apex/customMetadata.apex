Metadata.DeployContainer mdContainer = new Metadata.DeployContainer();

for (Timeline_Configuration__mdt tc : Timeline_Configuration__mdt.getAll().values()) {
  Metadata.CustomMetadata cMetadata = new Metadata.CustomMetadata();
  cMetadata.fullName = 'Timeline_Configuration__mdt.' + tc.DeveloperName;
  cMetadata.label = tc.MasterLabel;

  // Boolean display = String.isBlank(tc.Fallback_Tooltip_Field__c);

  // String iconUrl = tc.Icon__c;
  // String[] parts = iconUrl.split('/');
  // Integer last = parts.size() - 1;
  // String type = parts[last - 1];
  // String name = parts[last].substringBefore('.').remove('_120');
  // String icon = type + ':' + name;

  Map<String, Object> metadataFieldValueMap = new Map<String, Object>();
  metadataFieldValueMap.put('Activity_Subject_Field__c', tc.Detail_Field__c);
  // metadataFieldValueMap.put('Activity_Icon__c', icon);
  // metadataFieldValueMap.put('Activity_Line_Color__c', tc.Icon_Background_Colour__c);
  // metadataFieldValueMap.put('Display_Activity_Record_Form__c', display);

  for (String key : metadataFieldValueMap.keySet()) {
    Metadata.CustomMetadataValue cMetadataValue = new Metadata.CustomMetadataValue();
    cMetadataValue.Field = key;
    cMetadataValue.Value = metadataFieldValueMap.get(key);
    cMetadata.values.add(cMetadataValue);
  }

  mdContainer.addMetadata(cMetadata);
}

Id jobId = Metadata.Operations.enqueueDeployment(mdContainer, new CustomMetadataUtils());
System.debug('JobId: ' + jobId);
