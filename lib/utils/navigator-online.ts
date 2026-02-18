type NavigatorLike = {
  onLine?: boolean;
};

function getGlobalNavigator(): NavigatorLike | undefined {
  if (typeof navigator === "undefined") return undefined;
  return navigator;
}

export function readNavigatorOnlineState(
  navigatorLike: NavigatorLike | null | undefined = getGlobalNavigator()
): boolean {
  return typeof navigatorLike?.onLine === "boolean" ? navigatorLike.onLine : true;
}
