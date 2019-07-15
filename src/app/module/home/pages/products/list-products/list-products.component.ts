import {Component, Input, OnInit} from '@angular/core';
import {RestService} from '../../../../../shared/services/rest.service';
import {AuthshopService} from '../../../../auth/authshop.service';
import {UtilsService} from '../../../../../shared/services/util.service';

@Component({
  selector: 'app-list-products',
  templateUrl: './list-products.component.html',
  styleUrls: ['./list-products.component.css']
})
export class ListProductsComponent implements OnInit {
  public loading = false;
  @Input() id: any = null;
  public data: any = {data: []};
  public user_data: any = null;

  constructor(private rest: RestService, private auth: AuthshopService, private utils: UtilsService) {
  }

  ngOnInit() {
    this.loadData();
    this.user_data = this.auth.getCurrentUser();
  }

  loadData = () => {
    this.loading = true;
    this.rest.get(`/rest/seller/${this.id}?limit=10&filters=products.status,=,available`)
      .then((response: any) => {
        this.loading = false;
        if (response['status'] === 'success') {
          this.data = response['data'];

        }
      });
  };

  deleteProduct = (id, index = null) => {
    this.utils.openConfirm('¿Seguro?').then(r => {
      this.rest.put(`/rest/products/${id}`,
        {
          status: 'delete'
        })
        .then((response: any) => {
          this.loading = false;
          if (response['status'] === 'success') {
            this.utils.openSnackBar('Producto eliminado', 'success');
            this.data['data'].splice(index, 1);
          }
        });
    }).catch(e => {
    });

  };

}
