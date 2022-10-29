import type { ButtonRow } from "./button";
import type { SelectMenuRow } from "./selectMenu";

export function setComponent(...component: (ButtonRow | SelectMenuRow)[]) {
   const components = [];

   for (const unit of component) {
      const row = unit.row();
      if (!row) continue;
      else components.push(row);
   }

   return components;
}

export function disableComponent(...component: (ButtonRow | SelectMenuRow)[]) {
   const components = [];

   for (const unit of component) {
      const row = unit.disableAll().row();
      if (!row) continue;
      else components.push(row);
   }

   return components;
}
