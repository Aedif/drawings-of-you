import { MODULE_ID } from '../drawings-of-you.js';

export default class UserSelectApp extends Application {
  constructor() {
    super({}, {});
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'drawings-of-you-users',
      classes: ['sheet'],
      template: `modules/${MODULE_ID}/templates/users.html`,
      resizable: true,
      minimizable: false,
      title: 'Who should see your drawings?',
      width: 390,
      height: 'auto',
    });
  }

  async getData(options) {
    const data = super.getData(options);

    const displayTo = game.settings.get(MODULE_ID, 'displayTo');

    data.users = game.users
      .filter((u) => u.id !== game.user.id)
      .map((u) => {
        return {
          id: u.id,
          name: u.name,
          color: u.color.toHTML(),
          avatar: u.avatar,
          active: Boolean(displayTo[u.id]),
        };
      });

    return data;
  }

  /**
   * @param {JQuery} html
   */
  activateListeners(html) {
    super.activateListeners(html);
    html.on('click', '.user', this._onClickUser.bind(this));
  }

  _onClickUser(event) {
    const userElement = $(event.currentTarget);
    const userId = userElement.data('id');

    const displayTo = game.settings.get(MODULE_ID, 'displayTo');

    if (displayTo[userId]) {
      userElement.removeClass('active');
      delete displayTo[userId];
    } else {
      userElement.addClass('active');
      displayTo[userId] = true;
    }

    game.settings.set(MODULE_ID, 'displayTo', displayTo);
  }
}
