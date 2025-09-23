export default class cogwheel_syndicate_Utility {
  static async renderTemplate(path, data) {
    if (game.release.generation > 12) {
      return foundry.applications.handlebars.renderTemplate(path, data);
    } else {
      return renderTemplate(path, data);
    }
  }
}