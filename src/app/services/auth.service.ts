import { inject, Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user, User, setPersistence, browserLocalPersistence } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _auth = inject(Auth);
  private readonly _router = inject(Router);
  private readonly _firestore = inject(Firestore);
  
  // Observable puro para o estado do usuário
  readonly user$: Observable<User | null> = user(this._auth);
  
  // Observable para o status de admin
  // Admin = existe um documento admins/{email} no Firestore (mesma regra do firestore.rules)
  readonly isAdmin$: Observable<boolean> = this.user$.pipe(
    switchMap(u => (u?.email ? this.isAdminEmail(u.email) : of(false)))
  );

  private async isAdminEmail(email: string): Promise<boolean> {
    try {
      const snap = await getDoc(doc(this._firestore, 'admins', email));
      return snap.exists();
    } catch {
      return false;
    }
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      // Garante a persistência antes de logar
      await setPersistence(this._auth, browserLocalPersistence);
      
      const result = await signInWithPopup(this._auth, provider);
      const email = result.user.email;
      
      if (email && (await this.isAdminEmail(email))) {
        await this._router.navigate(['/admin']);
      } else {
        await this.logout();
        alert('Acesso negado: Este e-mail não é um administrador autorizado.');
      }
    } catch (error) {
      console.error('Erro no login:', error);
    }
  }

  async logout() {
    try {
      await signOut(this._auth);
      await this._router.navigate(['/']);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  }
}
