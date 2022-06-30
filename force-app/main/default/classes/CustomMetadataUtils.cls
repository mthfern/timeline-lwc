public class CustomMetadataUtils implements Metadata.DeployCallback {
  public void handleResult(Metadata.DeployResult result, Metadata.DeployCallbackContext context) {
    if (result.status == Metadata.DeployStatus.Succeeded) {
      System.debug(result.id + ' deployed successfully');
    } else {
      System.debug(result.id + ' deploy error');
    }
  }
}
