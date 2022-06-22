@isTest
public class TimelineViewPicklistTest {
    @isTest
    static void testTimelineViewPicklistDefaultValue() {
        VisualEditor.DesignTimePageContext context = new VisualEditor.DesignTimePageContext();
        context.entityName = 'Contact';

        TimelineViewPicklist timeline = new TimelineViewPicklist(context);

        Test.startTest();
        VisualEditor.DataRow defaultValue = timeline.getDefaultValue();
        Test.stopTest();

        System.assertEquals(
            'View All',
            defaultValue.getLabel(),
            'Timeline View Picklist default value incorrect'
        );
    }

    @isTest
    static void testTimelineViewPicklistValues() {
        VisualEditor.DesignTimePageContext context = new VisualEditor.DesignTimePageContext();
        context.entityName = 'Contact';

        TimelineViewPicklist timeline = new TimelineViewPicklist(context);

        Test.startTest();
        VisualEditor.DynamicPickListRows picklistValues = timeline.getValues();
        Test.stopTest();

        System.assert(picklistValues.size() > 0, 'No view picklist values found');
    }
}