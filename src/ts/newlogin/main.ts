import { get, writable } from "svelte/store";
import { Log } from "../console";
import type { State } from "../state/interfaces";
import { LogLevel } from "../console/interface";
import { getUsers } from "../userlogic/main";
import { ConnectedServer } from "../api/main";
import sleep from "../sleep";
import { applyState } from "../state/main";
import { loginUsingCreds } from "../api/getter";
import { fromBase64, toBase64 } from "../base64";
import { applyLoginState } from "../login/main";
import { UserData, UserName, UserToken } from "../userlogic/interfaces";

export class Login {
  public CurrentState = writable<State>();
  public UserName = writable<string>();
  private _defaultState: string;
  private _states: Map<string, State>;

  constructor(
    states: Map<string, State>,
    initialState: string,
    doOnMount = true
  ) {
    Log("newlogin/main.ts: Login.constructor", `Creating new login class`);

    this._states = states;
    this._defaultState = initialState;

    if (doOnMount) this.onMount();
  }

  navigate(state: string, fromInit = false) {
    if (!this._states.has(state) && !fromInit) {
      if (!fromInit) return this.navigate(this._defaultState);

      return Log(
        "newlogin/main.ts: Login.navigate",
        `Can't use non-existent initial state ${this._defaultState}!`,
        LogLevel.critical
      );
    }

    Log("newlogin/main.ts: Login.navigate", `Navigating to ${state}`);

    this.CurrentState.set(this._states.get(state));
  }

  private async onMount() {
    const allUsers = await getUsers();
    const remembered = localStorage.getItem("arcos-remembered-token");
    const loginState = get(this.CurrentState);
    const currentApi = get(ConnectedServer);
    const isFreshApi = !Object.keys(allUsers).length && !remembered;
    const stateIsIncoming = loginState
      ? loginState.key != "shutdown" && loginState.key != "restart"
      : true;

    Log(
      "newlogin/main.ts: Login.onMount",
      `isFreshApi=${isFreshApi} StateIsIncoming=${stateIsIncoming}`
    );

    if (isFreshApi) {
      if (!currentApi) return applyState("fts");

      return this.navigate("newuserauth");
    }

    if (!loginState) this.navigate(remembered ? "autologin" : "selector");
    if (!remembered || !stateIsIncoming) return;

    const username = fromBase64(remembered).split(":")[0];

    this.setUser(username);

    const userdata = await loginUsingCreds(remembered);

    if (!userdata) {
      applyLoginState("selector");

      localStorage.removeItem("arcos-remembered-token");

      return;
    }

    this.proceed(userdata, username);
  }

  public async Authenticate(username: string, password: string) {
    const token = toBase64(`${username}:${password}`);
    const userdata = await loginUsingCreds(token);

    if (!userdata) return false;

    localStorage.setItem("arcos-remembered-token", token);
    UserData.set(userdata);

    this.setUser(username);

    return userdata;
  }

  public setUser(username: string) {
    this.UserName.set(username);
  }

  public async proceed(userdata: Object, username: string, delay = 1500) {
    Log(
      "newlogin/main.ts: Login.proceed",
      `Proceeding to desktop after ${delay / 1000} seconds`
    );

    this.UserName.set(username);

    this.setUser(username);
    UserData.set(userdata as UserData);

    await sleep(delay);

    applyState("desktop");
  }
}