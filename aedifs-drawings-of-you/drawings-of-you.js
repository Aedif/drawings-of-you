import { renderHUDElement } from './scripts/hud.js';
import UserSelectApp from './scripts/userApp.js';

export const MODULE_ID = 'aedifs-drawings-of-you';

Hooks.on('init', () => {
  game.settings.register(MODULE_ID, 'displayTo', {
    scope: 'client',
    config: false,
    type: Object,
    default: {},
  });

  libWrapper.register(
    MODULE_ID,
    'Drawing.prototype.isVisible',
    function (wrapped) {
      const displayTo = this.document.getFlag(MODULE_ID, 'displayTo');

      if (displayTo) {
        return this.isAuthor || displayTo[game.user.id];
      } else {
        return wrapped();
      }
    },
    'MIXED'
  );

  Hooks.on('preCreateDrawing', (document, data, options, userId) => {
    const displayTo = game.settings.get(MODULE_ID, 'displayTo');
    if (!foundry.utils.isEmpty(displayTo)) {
      const update = { flags: { [MODULE_ID]: { displayTo } } };
      foundry.utils.setProperty(data, `flags.${MODULE_ID}.displayTo`, update);
      document.updateSource(update);
    }
  });

  Hooks.on('getSceneControlButtons', (controls) => {
    const drawingsControls = controls.find((c) => c.name === 'drawings');

    drawingsControls.tools.push({
      name: 'drawingsOfYouDisplayTo',
      title: 'Drawings of You',
      icon: 'fa-solid fa-users-rectangle',
      // visible: true,
      active: Boolean(Object.values(ui.windows).find((w) => w instanceof UserSelectApp)),
      toggle: true,
      onClick: () => {
        new UserSelectApp().render(true);
      },
    });
  });

  Hooks.on('renderDrawingHUD', (hud, html, options) => {
    renderHUDElement(hud, html);
  });
});

Hooks.on('ready', () => {
  // const isResponsibleGM = !game.users
  //   .filter((user) => user.isGM && (user.active || user.isActive))
  //   .some((other) => other.id < game.user.id);
  // if (isResponsibleGM) startTicker();
});
