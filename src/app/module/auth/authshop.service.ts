import {EventEmitter, Injectable, Output} from '@angular/core';
import {RestService} from '../../shared/services/rest.service';
import {UtilsService} from '../../shared/services/util.service';
import {Router} from '@angular/router';
import {UserModel} from '../../shared/models/base.model';
import {CookieService} from 'ngx-cookie-service';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class AuthshopService {
  private _currentUser: UserModel;
  public waiting: boolean;
  @Output() getLoggedInData: EventEmitter<any> = new EventEmitter();

  nowCookies = moment().add(15, 'days').toDate();

  constructor(private rest: RestService,
              private utils: UtilsService,
              private router: Router,
              private cookieService: CookieService
  ) {
    // if (this.localtoken && this.cookieService.get('_currentUser')) {
    //   this.rest.headers = this.rest.headers.set('Authorization', 'Bearer ' + this.localtoken);
    //   this.rest.headers = this.rest.headers.set('deviceInfo', '{"language_local":"en-US","uuid":"unknown","os":"Web",' +
    //     '"os_version":"unknown","device":"unknown","carrier":"unknown"}');
    // } else if (!this.rest.headers) {
    //   console.error('headers object is not available!');
    // }

  }

  public login(email: string, password: string, name: string = null): Promise<boolean> {
    return new Promise<boolean>(((resolve, reject) => {
      this.waiting = true;
      this.rest.post('/auth', {email, password, name})
        .then(((response: any) => {
          console.log(response);
          if (response.data) {
            const token = response.data['token'];
            if (token) {
              this._currentUser = response.data;
              this._currentUser['menu_rol'] = 'user';
              this.emitlogin(this._currentUser);
              this.cookieService.set(
                '_currentUser',
                JSON.stringify(response.data),
                this.nowCookies,
                '/'
              );

              resolve(response.data);
            }
            resolve(false);
          } else {
            resolve(false);
          }
          this.waiting = false;
        }).bind(this))
        .catch((e) => {
          this.waiting = false;
          reject(e);
        });
    }).bind(this));
  }

  public login_social(data): Promise<boolean> {
    return new Promise<boolean>(((resolve, reject) => {
      this.waiting = true;
      this.rest.post('/auth', data)
        .then(((response: any) => {
          console.log(response);
          if (response.data) {
            const token = response.data['token'];
            if (token) {
              this._currentUser = response.data;
              this._currentUser['menu_rol'] = 'user';
              this.emitlogin(this._currentUser);
              this.cookieService.set(
                '_currentUser',
                JSON.stringify(response.data),
                this.nowCookies,
                '/'
              );

              resolve(response.data);
            }
            resolve(false);
          } else {
            resolve(false);
          }
          this.waiting = false;
        }).bind(this))
        .catch((e) => {
          this.waiting = false;
          reject(e);
        });
    }).bind(this));
  }

  public logout(): void {
    localStorage.clear();
    this.waiting = true;
    this.cleanSession();
    this.cookieService.deleteAll();
    this.utils.openSnackBar('sesión finalizada', 'success');
  }

  public validate(): Promise<string> {
    return new Promise<string>(((resolve, reject) => {
      this.waiting = true;
      if (this.localtoken) {
        this.rest.get('/auth').then(((response: any) => {
          const _tmp_current = this.getCurrentUser();
          _tmp_current['token'] = response.data;
          this.cookieService.set(
            '_currentUser',
            JSON.stringify(_tmp_current),
            this.nowCookies,
            '/'
          );

          this.waiting = false;
          console.log('Second Validation');
          resolve(response.message);
        }).bind(this)).catch((error) => {
          this.cleanSession();
          this.router.navigateByUrl('/login');
          this.waiting = false;
          reject(error.message);
        });
      } else {
        this.cleanSession();
        this.router.navigateByUrl('/login');
      }
    }).bind(this));
  }

  private get localtoken(): string {
    const obj = this.cookieService.get('_currentUser');
    if (obj && JSON.parse(obj)) {
      return JSON.parse(obj)['token'];
    } else {
      return null;
    }
  }

  public get isAuthenticated(): boolean {
    return !!this.localtoken;
    // return !!this.localtoken && this.rest.headers.has('Authorization');
  }

  public get user(): UserModel {
    return this._currentUser;
  }


  public getCurrentUser() {
    const _current = this.cookieService.get('_currentUser');
    const _parseCurrent = (_current && JSON.parse(this.cookieService.get('_currentUser'))) ?
      JSON.parse(this.cookieService.get('_currentUser')) : null;
    return (_current && _parseCurrent) ? _parseCurrent : null;
  }


  public updateUser = (key, data) => {
    if (key && data) {
      const _current = this.cookieService.get('_currentUser');
      const _parseCurrent = (_current && JSON.parse(this.cookieService.get('_currentUser'))) ?
        JSON.parse(this.cookieService.get('_currentUser')) : null;
      _parseCurrent[key] = data;
      this.cookieService.set(
        '_currentUser',
        JSON.stringify(_parseCurrent),
        this.nowCookies,
        '/'
      );

      this.utils.updateProfile.emit(_parseCurrent);
      return true;
    } else {
      return false;
    }
  };

  public emitlogin(data) {
    this.getLoggedInData.emit(data);
  }

  public cleanSession() {
    this._currentUser = null;
    this.rest.headers.delete('Authorization');
    localStorage.removeItem('currentUser');
    this.getLoggedInData.emit(null);
  }
}
