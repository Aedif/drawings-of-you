import { MODULE_ID } from '../drawings-of-you.js';

export async function renderHUDElement(hud, html) {
  const displayTo = hud.object.document.getFlag(MODULE_ID, 'displayTo') ?? {};

  const users = game.users
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

  const hudElement = $(
    await renderTemplate(`modules/${MODULE_ID}/templates/usersHUD.html`, {
      users,
    })
  );

  hudElement.on('click', '.control-icon', _onUserClick.bind(hud.object.document));

  html.find('.col.middle').append(hudElement);
}

function _onUserClick(event) {
  const userElement = $(event.currentTarget);
  const userId = userElement.data('id');

  const displayTo = this.getFlag(MODULE_ID, 'displayTo') ?? {};

  if (displayTo[userId]) {
    userElement.removeClass('active');
    this.update({ [`flags.${MODULE_ID}.displayTo.-=${userId}`]: null });
  } else {
    userElement.addClass('active');
    this.update({ [`flags.${MODULE_ID}.displayTo.${userId}`]: true });
  }
}
