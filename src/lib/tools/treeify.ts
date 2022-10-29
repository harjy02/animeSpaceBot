//     treeify.js
//     Luke Plaster <notatestuser@gmail.com>
//     https://github.com/notatestuser/treeify.js

// Treeify.asTree
// --------------------
// Outputs the entire tree, returning it as a string with line breaks.

//Edited by kyros

export function asTree(obj: Record<any, any>) {
   const showValues = true;
   const hideFunctions = false;

   let tree = "";
   growBranch(".", obj, false, [], showValues, hideFunctions, (line: string) => {
      tree += line + "\n";
   });
   return tree;
}

// --------------------

function makePrefix(key: string, last: boolean) {
   let str = last ? "└" : "├";
   if (key) str += "─ ";
   else str += "──┐";

   return str;
}

function filterKeys(obj: Record<any, any>, hideFunctions: boolean) {
   const keys = [];
   for (const branch in obj) {
      // always exclude anything in the object's prototype
      if (!obj.hasOwnProperty(branch)) continue;

      // ... and hide any keys mapped to functions if we've been told to
      if (hideFunctions && typeof obj[branch] === "function") continue;

      keys.push(branch);
   }
   return keys;
}

function growBranch(
   key: string,
   root: Record<any, any>,
   last: boolean,
   lastStates: any[],
   showValues: boolean,
   hideFunctions: boolean,
   callback: (string: string) => void,
) {
   let line = "",
      index = 0,
      lastKey,
      circular = false;

   const lastStatesCopy = lastStates.slice(0);

   if (lastStatesCopy.push([root, last]) && lastStates.length > 0) {
      // based on the "was last element" states of whatever we're nested within,
      // we need to append either blankness or a branch to our line
      lastStates.forEach(function (lastState, idx) {
         if (idx > 0) line += (lastState[1] ? " " : "│") + "  ";

         if (!circular && lastState[0] === root) circular = true;
      });

      // the prefix varies based on whether the key contains something to show and
      // whether we're dealing with the last element in this collection
      line += makePrefix(key, last) + key;

      // append values and the circular reference indicator

      if (showValues && (typeof root !== "object" || root instanceof Date))
         line += ": " + root;
      if (circular) line += " (circular ref.)";

      callback(line);
   }

   // can we descend into the next item?
   if (!circular && typeof root === "object") {
      const keys = filterKeys(root, hideFunctions);
      keys.forEach(function (branch) {
         // the last key is always printed with a different prefix, so we'll need to know if we have it
         lastKey = ++index === keys.length;

         // hold your breath for recursive action
         growBranch(
            branch,
            root[branch],
            lastKey,
            lastStatesCopy,
            showValues,
            hideFunctions,
            callback,
         );
      });
   }
}
