import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { AddItemToBasket } from '../../../checkout/store/basket';
import { Category } from '../../../models/category/category.model';
import { Product } from '../../../models/product/product.model';
import { isInCompareProducts, ToggleCompare } from '../../store/compare';
import { ShoppingState } from '../../store/shopping.state';

@Component({
  selector: 'ish-product-tile-container',
  templateUrl: './product-tile.container.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductTileContainerComponent implements OnInit {
  @Input() product: Product;
  @Input() category?: Category;

  isInCompareList$: Observable<boolean>;

  constructor(private store: Store<ShoppingState>) {}

  ngOnInit() {
    this.isInCompareList$ = this.store.pipe(select(isInCompareProducts(this.product.sku)));
  }

  toggleCompare() {
    this.store.dispatch(new ToggleCompare(this.product.sku));
  }

  addToCart() {
    // TODO: should be dispatched on checkout state, not shopping state
    this.store.dispatch(new AddItemToBasket({ sku: this.product.sku, quanity: this.product.minOrderQuantity }));
  }
}
