public with sharing class TimelineViewPicklist extends VisualEditor.DynamicPickList {

    VisualEditor.DesignTimePageContext context;
    
    public TimelineViewPicklist(VisualEditor.DesignTimePageContext context) {
        this.context = context;
    }

    public override VisualEditor.DataRow getDefaultValue(){
        VisualEditor.DataRow defaultValue = new VisualEditor.DataRow('View All', 'ALL');
        return defaultValue;        
    }

    public override VisualEditor.DynamicPickListRows getValues() {
        VisualEditor.DynamicPickListRows  myValues = new VisualEditor.DynamicPickListRows();
        myValues.addRow(this.getDefaultValue());

        for (TimelineView__mdt record : TimelineView__mdt.getAll().values()) {
            if (!record.Test__c || Test.isRunningTest()) {
                myValues.addRow(new VisualEditor.DataRow(record.MasterLabel, record.DeveloperName));
            }
        }
        return myValues;
    }    
}