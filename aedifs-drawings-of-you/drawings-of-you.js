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

  game.settings.register(MODULE_ID, 'gmSeesAll', {
    scope: 'global',
    config: false,
    type: Boolean,
    default: false,
    onChange: () => {
      canvas.drawings.placeables.forEach((p) => p.renderFlags.set({ refreshState: true }));
    },
  });

  libWrapper.register(
    MODULE_ID,
    'Drawing.prototype.isVisible',
    function (wrapped) {
      const displayTo = this.document.getFlag(MODULE_ID, 'displayTo');

      if (!foundry.utils.isEmpty(displayTo)) {
        return (
          this.isAuthor || displayTo[game.user.id] || (game.user.isGM && game.settings.get(MODULE_ID, 'gmSeesAll'))
        );
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

    drawingsControls.tools.push(
      {
        name: 'drawingsOfYouDisplayTo',
        title: 'Drawings of You',
        icon: 'fa-solid fa-users-rectangle',
        // visible: true,
        active: Boolean(Object.values(ui.windows).find((w) => w instanceof UserSelectApp)),
        toggle: true,
        onClick: () => {
          new UserSelectApp().render(true);
        },
      },
      {
        name: 'drawingsOfYouSeeAll',
        title: 'Drawings of You: GM Sees All',
        icon: 'fa-solid fa-eye',
        visible: game.user.isGM,
        active: game.settings.get(MODULE_ID, 'gmSeesAll'),
        toggle: true,
        onClick: () => {
          game.settings.set(MODULE_ID, 'gmSeesAll', !game.settings.get(MODULE_ID, 'gmSeesAll'));
        },
      }
    );
  });

  Hooks.on('renderDrawingHUD', (hud, html, options) => {
    renderHUDElement(hud, html);
  });

  game.socket?.on(`module.${MODULE_ID}`, async (message) => {
    const args = message.args;
    console.log('BROADCAST RECEIVED', args);
    if (message.handlerName === 'drawing' && message.type === 'REFRESH') {
      if (canvas.scene.id === args.sceneId) {
        canvas.drawings.placeables
          .find((p) => p.document.id === args.drawingId)
          ?.renderFlags.set({ refreshState: true });
      }
    }
  });
});
