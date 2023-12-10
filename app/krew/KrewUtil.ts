import { msg } from "common-app-module";

export default class KrewUtil {
  public static getName(krew: { id: string; name?: string }): string {
    if (krew.name) return krew.name;
    if (krew.id.startsWith("p_")) {
      return msg("default-personal-krew-name", { id: krew.id.substring(2) });
    } else if (krew.id.startsWith("c_")) {
      return msg("default-communal-krew-name", { id: krew.id.substring(2) });
    }
    return "";
  }
}
