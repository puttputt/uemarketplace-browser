import { Component } from '@angular/core';
import * as items from '../assets/clean.json';
import { PageEvent } from '@angular/material/paginator';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { FormControl } from '@angular/forms';

export enum SortOption {
    TitleAz = 1,
    TitleZa = 2,
    PriceLh = 3,
    PriceHl = 4,
    DiscountHl = 5,
    Newest = 6,
    Oldest = 7,
    RatingHl = 8,
    RatingLh = 9,
    ReviewsHl = 10,
    ReviewsLh = 11,
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    sortOption = SortOption;
    sortSelect = new FormControl(-1);
    sortValue = -1;

    title = 'uemarketplace';

    length;

    displayedColumns: string[] = ['title', 'image', 'price', 'discount', 'categories', 'rating', 'reviews'];
    dataSource = [];

    content = items['default'];

    pageEvent: PageEvent;

    categories = [];

    filterCategories = [];
    filterMinPrice;
    filterMaxPrice;
    filterAvgRating;
    filterReviews;
    filterOnSale;

    checked = false;

    constructor(private iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
        this.length = this.content.length;
        this.dataSource = this.content.slice(0, 10);
        this.loadCategories();
    }

    public page(event: PageEvent) {
        this.pageEvent = event;
        this.reload();
    }

    public minPriceChanged($event) {
        this.filterMinPrice = $event.value;
        this.reload();
    }

    public maxPriceChanged($event) {
        this.filterMaxPrice = $event.value;
        this.reload();
    }

    public ratingChanged($event) {
        this.filterAvgRating = $event.value;
        this.reload();
    }

    public reviewCountChanged($event) {
        this.filterReviews = $event.value;
        this.reload();
    }

    public categoryChange($event, category) {
        if ($event.checked) {
            this.addFilteredCategory(category);
        } else {
            this.removeFilteredCategory(category);
        }

        this.reload();
    }

    public sortChanged($event): void {
        this.sortValue = $event.value;
        this.reload();
    }

    public isChecked(category): boolean {
        if (this.filterCategories.find((item) => item.name === category.name)) {
            return true;
        } else {
            return false;
        }
    }

    public resetFilters(): void {
        this.filterCategories = [];
        this.filterMinPrice = null;
        this.filterMaxPrice = null;
        this.filterAvgRating = null;
        this.filterReviews = null;
        this.checked = false;
        this.reload();
    }

    public onSaleToggle($event): void {
        this.filterOnSale = $event.checked;
        this.reload();
    }

    private addFilteredCategory(category) {
        this.filterCategories.push(category);
    }

    private removeFilteredCategory(category) {
        this.filterCategories = this.filterCategories.filter((item) => item.name !== category.name);
    }

    private loadCategories(): void {
        const allCategories = this.content.map((item) => {
            return item.categories;
        });

        const flatCategories = [].concat(...allCategories);

        this.categories = flatCategories
            .reduce((acc, curr) => {
                const exists = acc.find((item) => item.name === curr.name);

                if (exists) {
                    return acc;
                } else {
                    return [...acc, curr];
                }
            }, [])
            .sort((a, b) => a.name > b.name);
    }

    private reload(): void {
        this.dataSource = [...this.content];

        //apply filters
        this.dataSource = this.filterSale();
        this.dataSource = this.filterMaxPrices();
        this.dataSource = this.filterMinPrices();
        this.dataSource = this.filterAvgRatings();
        this.dataSource = this.filterNumReviews();
        this.dataSource = this.filterCategory();

        //apply sort
        this.sortData(this.sortValue);

        //reset page
        this.length = this.dataSource.length;
        this.slicePage();
    }

    private sortData(value: number) {
        switch (value) {
            case SortOption.TitleAz:
                this.sortTitle('asc');
                break;
            case SortOption.TitleZa:
                this.sortTitle('desc');
                break;
            case SortOption.PriceHl:
                this.sortPrice('desc');
                break;
            case SortOption.PriceLh:
                this.sortPrice('asc');
                break;
            case SortOption.DiscountHl:
                this.sortByDiscount('desc');
                break;
            case SortOption.Newest:
                break;
            case SortOption.Oldest:
                break;
            case SortOption.RatingHl:
                this.sortByRating('desc');
                break;
            case SortOption.RatingLh:
                this.sortByRating('asc');
                break;
            case SortOption.ReviewsHl:
                this.sortByReviews('desc');
                break;
            case SortOption.ReviewsLh:
                this.sortByReviews('asc');
                break;
            default:
                break;
        }
    }

    // FILTERING

    private filterCategory(): any[] {
        if (this.filterCategories.length === 0) {
            return this.dataSource;
        }

        const filterNames = this.filterCategories.map((cat) => cat.name);

        return this.dataSource.filter((item) => {
            const itemCategories = item.categories.map((cat) => cat.name);

            const resultMap = itemCategories.map((element) => {
                if (filterNames.includes(element)) {
                    return true;
                }
            });

            if (resultMap[0]) {
                return true;
            } else {
                return false;
            }
        });
    }

    private filterMinPrices(): any[] {
        if (!this.filterMinPrice) {
            return this.dataSource;
        }

        return this.dataSource.filter((item) => {
            return item.priceValue / 100 > this.filterMinPrice;
        });
    }

    private filterMaxPrices(): any[] {
        if (!this.filterMaxPrice) {
            return this.dataSource;
        }

        return this.dataSource.filter((item) => {
            return item.priceValue / 100 < this.filterMaxPrice;
        });
    }

    private filterAvgRatings(): any[] {
        if (!this.filterAvgRating) {
            return this.dataSource;
        }

        return this.dataSource.filter((item) => {
            if (item.rating) {
                return item.rating.averageRating >= this.filterAvgRating;
            }
        });
    }

    private filterNumReviews(): any[] {
        if (!this.filterReviews) {
            return this.dataSource;
        }

        return this.dataSource.filter((item) => {
            if (item.rating) {
                return item.rating.total >= this.filterReviews;
            }
        });
    }

    private slicePage() {
        if (!this.pageEvent) {
            this.dataSource = this.dataSource.slice(0, 10);
        } else {
            const next = this.pageEvent.pageIndex * this.pageEvent.pageSize;
            this.dataSource = this.dataSource.slice(next, next + this.pageEvent.pageSize);
        }
    }

    private filterSale(): any[] {
        if (!this.filterOnSale) {
            return this.dataSource;
        }

        return this.dataSource.filter((item) => {
            return item.discount;
        });
    }

    // SORTING

    private sortTitle(direction: string): void {
        this.dataSource = this.dataSource.sort((a, b) => {
            const aTitle = a.title.toUpperCase();
            const bTitle = b.title.toUpperCase();

            if (aTitle < bTitle) {
                if (direction == 'asc') {
                    return -1;
                } else {
                    return 1;
                }
            } else if (aTitle > bTitle) {
                if (direction == 'asc') {
                    return 1;
                } else {
                    return -1;
                }
            } else {
                return 0;
            }
        });
    }

    private sortPrice(direction: string): void {
        this.dataSource = this.dataSource.sort((a, b) => {
            const aPrice = a.priceValue;
            const bPrice = b.priceValue;

            if (aPrice < bPrice) {
                if (direction == 'asc') {
                    return -1;
                } else {
                    return 1;
                }
            } else if (aPrice > bPrice) {
                if (direction == 'asc') {
                    return 1;
                } else {
                    return -1;
                }
            } else {
                return 0;
            }
        });
    }

    private sortByRating(direction: string): void {
        this.dataSource = this.dataSource.sort((a, b) => {
            const A = a.rating ? a.rating.averageRating : 0;
            const B = b.rating ? b.rating.averageRating : 0;

            if (A < B) {
                if (direction == 'asc') {
                    return -1;
                } else {
                    return 1;
                }
            } else if (A > B) {
                if (direction == 'asc') {
                    return 1;
                } else {
                    return -1;
                }
            } else {
                return 0;
            }
        });
    }

    private sortByReviews(direction: string): void {
        this.dataSource = this.dataSource.sort((a, b) => {
            const A = a.rating ? a.rating.total : 0;
            const B = b.rating ? b.rating.total : 0;

            if (A < B) {
                if (direction == 'asc') {
                    return -1;
                } else {
                    return 1;
                }
            } else if (A > B) {
                if (direction == 'asc') {
                    return 1;
                } else {
                    return -1;
                }
            } else {
                return 0;
            }
        });
    }

    private sortByDiscount(direction: string): void {
        this.dataSource = this.dataSource.sort((a, b) => {
            const A = a.discountPriceValue;
            const B = b.discountPriceValue;

            if (A < B) {
                if (direction == 'asc') {
                    return -1;
                } else {
                    return 1;
                }
            } else if (A > B) {
                if (direction == 'asc') {
                    return 1;
                } else {
                    return -1;
                }
            } else {
                return 0;
            }
        });
    }
}
