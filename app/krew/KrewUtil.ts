import Krew from "../database-interface/Krew.js";

export default class KrewUtil {
  public static getName(krew: { id: string; name?: string }): string {
    if (krew.name) return krew.name;
    if (krew.id.startsWith("p_")) {
      return `Personal Krew #${krew.id.substring(2)}`;
    } else if (krew.id.startsWith("c_")) {
      return `Communal Krew #${krew.id.substring(2)}`;
    }
    return "";
  }
}
