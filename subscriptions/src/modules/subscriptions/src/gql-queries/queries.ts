import { FetchPolicy } from 'apollo-client';
import graphqlTag from 'graphql-tag';

export const NO_CACHE_POLICY: FetchPolicy = 'no-cache';

export const PRODUCT_QUERY: any = graphqlTag`
  query getProducts($id: String!) {
    product(id: $id) {
      businessUuid
      images
      currency
      id
      title
      description
      onSales
      price
      salePrice
      vatRate
      sku
      barcode
      type
      active
      collections {
        _id
        name
        description
      }
      categories {
        id
        slug
        title
      }
      channelSets {
        id
        type
        name
      }
      variants {
        id
        images
        options {
          name
          value
        }
        description
        onSales
        price
        salePrice
        sku
        barcode
      }
      shipping {
        weight
        width
        length
        height
      }
    }
  }
`;

export const QUERY_CREATE: any = graphqlTag`
  mutation createProduct($product: ProductInput!) {
    createProduct(product: $product) {
      title
      id
    }
  }
`;

export const QUERY_UPDATE: any = graphqlTag`
  mutation updateProduct($product: ProductUpdateInput!) {
    updateProduct(product: $product) {
      title
      id
    }
  }
`;

export const DELETE_PRODUCT_QUERY = graphqlTag`
  mutation deleteProduct($ids: [String]) {
    deleteProduct(ids: $ids)
  }
`;

export const GET_CATEGORIES_QUERY: any = graphqlTag`
  query getCategories($businessUuid: String!, $titleChunk: String, $page: Int, $perPage: Int) {
    getCategories(businessUuid: $businessUuid, title: $titleChunk, pageNumber: $page, paginationLimit: $perPage) {
      id
      slug
      title
      businessUuid
    }
  }
`;

export const GET_PRODUCT_RECOMMENDATIONS_QUERY: any = graphqlTag`
query getProductRecommendations($id: String!) {
  getProductRecommendations(id: $id) {
    tag
    recommendations {
      id
      images
      name
    }
  }
}
`;

export const GET_RECOMMENDATIONS_QUERY: any = graphqlTag`
query getRecommendations($businessUuid: String!) {
  getRecommendations(businessUuid: $businessUuid) {
    tag
    recommendations {
      id
      images
      name
    }
  }
}
`;

export const CREATE_CATEGORY_QUERY: any = graphqlTag`
  mutation createCategory($businessUuid: String!, $title: String!) {
    createCategory(category: { businessUuid: $businessUuid, title: $title }) {
      id
      businessUuid
      title
      slug
    }
  }
`;

export const IS_SKU_USED_QUERY: any = graphqlTag`
  query isSkuUsed($sku: String!, $businessUuid: String!, $productId: String) {
    isSkuUsed(sku: $sku, businessUuid: $businessUuid, productId: $productId)
  }
`;
