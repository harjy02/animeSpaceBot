export const statsLogChannelId = "985162945896001586";

const commandStatistics: Map<string, number> = new Map();

export function getCommandStatistics() {
   const stats = [];

   for (const [key, value] of commandStatistics) {
      stats.push({
         commandName: key,
         count: value,
      });
   }

   return stats;
}

export function resetCommandStatistics() {
   commandStatistics.clear();
}
export function addCommandStatistics(commandName: string) {
   const command = commandStatistics.get(commandName);

   if (command) commandStatistics.set(commandName, command + 1);
   else commandStatistics.set(commandName, 1);
}

const interactionStatistics: Map<string, number> = new Map();

export function getInteractionStatistics() {
   const stats = [];

   for (const [key, value] of interactionStatistics) {
      stats.push({
         InteractionName: key,
         count: value,
      });
   }

   return stats;
}

export function resetInteractionStatistics() {
   interactionStatistics.clear();
}

export function addInteractionStatistics(interactionName: string) {
   const interaction = interactionStatistics.get(interactionName);

   if (interaction) interactionStatistics.set(interactionName, interaction + 1);
   else interactionStatistics.set(interactionName, 1);
}
